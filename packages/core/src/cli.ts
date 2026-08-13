import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as ui from '@cliffx/ui';
import type { Command, CommandDef, CliOptions, Plugin } from './types';
import { discoverPlugins } from './plugin';
import { checkForUpdates } from './update';
import { parseArgs } from './parser';
import { generateHelp, generateRootHelp } from './help';
import { loadConfig, loadEnv, envPrefix, resolveOptions } from './config';

export class Cli {
  private commands = new Map<string, Command>();
  private plugins: Plugin[] = [];
  private options: CliOptions;
  private loadedConfig: Record<string, unknown> = {};

  constructor(options: CliOptions) {
    this.options = {
      commandsDir: 'commands',
      ...options,
    };
    this.plugins = options.plugins ?? [];
  }

  /** Register a command programmatically. */
  register(def: CommandDef): void {
    this.commands.set(def.name, { def });
  }

  /** Load a plugin. */
  use(plugin: Plugin): void {
    this.plugins.push(plugin);
    if (plugin.commands) {
      for (const [name, def] of Object.entries(plugin.commands)) {
        this.commands.set(name, { def });
      }
    }
  }

  /** Discover commands from the filesystem. */

  /** Discover plugins from the filesystem. */
  async discoverAllPlugins(baseDir: string): Promise<void> {
    const plugins = await discoverPlugins(baseDir, this.options.pluginsDir);
    for (const plugin of plugins) {
      this.use(plugin);
    }
  }
  async discover(baseDir: string): Promise<void> {
    const dir = join(baseDir, this.options.commandsDir!);
    if (!existsSync(dir)) return;
    await this.scanDir(dir, baseDir);
  }

  private async scanDir(dir: string, baseDir: string, parentName?: string): Promise<void> {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        const indexFile = join(fullPath, 'index.ts');
        if (existsSync(indexFile)) {
          const mod = await this.loadModule(indexFile);
          const cmd = this.extractCommand(mod, entry);
          if (cmd) {
            cmd.parentName = parentName;
            this.commands.set(cmd.def.name, cmd);
          }
        }
        await this.scanDir(fullPath, baseDir, parentName ? `${parentName} ${entry}` : entry);
      } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.js'))) {
        if (entry === 'index.ts' || entry === 'index.js') continue;
        const mod = await this.loadModule(fullPath);
        const name = entry.replace(/\.(ts|js)$/, '');
        const cmd = this.extractCommand(mod, name);
        if (cmd) {
          cmd.parentName = parentName;
          cmd.filePath = relative(baseDir, fullPath);
          this.commands.set(parentName ? `${parentName} ${cmd.def.name}` : cmd.def.name, cmd);
        }
      }
    }
  }

  private async loadModule(filePath: string): Promise<Record<string, unknown>> {
    const url = pathToFileURL(filePath).href;
    const mod = await import(url);
    return mod;
  }

  private extractCommand(mod: Record<string, unknown>, defaultName: string): Command | null {
    const exported = mod.default || mod[defaultName];
    if (!exported || typeof exported !== 'object' || !('def' in exported)) return null;
    const cmd = exported as Command;
    if (!cmd.def.name) {
      cmd.def.name = defaultName;
    }
    return cmd;
  }

  /** Get all registered commands. */
  getCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  /** Run the CLI with the given arguments. */
  async run(args: string[] = process.argv.slice(2)): Promise<void> {

    // Check for updates (non-blocking)
    if (this.options.version) {
      checkForUpdates(this.options.name, this.options.version).catch(() => {});
    }
    if (args.length === 0) {
      this.showRootHelp();
      return;
    }

    // Determine command name (support nested: "deploy status")
    let cmdName = '';
    let remainingArgs = args;
    let matchedCommand: Command | undefined;

    for (let i = args.length; i > 0; i--) {
      const candidate = args.slice(0, i).join(' ');
      const cmd = this.commands.get(candidate);
      if (cmd) {
        cmdName = candidate;
        remainingArgs = args.slice(i);
        matchedCommand = cmd;
        break;
      }
    }

    if (!matchedCommand) {
      if (args[0] === '--help' || args[0] === '-h') {
        this.showRootHelp();
        return;
      }
      if (args[0] === '--version' || args[0] === '-v') {
        this.showVersion();
        return;
      }
      if (args.includes('--help') || args.includes('-h')) {
        const helpIdx = args.indexOf('--help');
        const cmdArgs = args.slice(0, helpIdx >= 0 ? helpIdx : args.indexOf('-h'));
        const cmd = this.commands.get(cmdArgs.join(' '));
        if (cmd) {
          process.stderr.write(generateHelp(cmd, this.options.name));
          return;
        }
      }
      ui.error(`Unknown command: ${args.join(' ')}`);
      ui.log(`Run ${this.options.name} --help for available commands.`);
      process.exit(1);
    }

    const { def } = matchedCommand;

    // Handle --help / --version for subcommand
    if (remainingArgs.includes('--help') || remainingArgs.includes('-h')) {
      process.stderr.write(generateHelp(matchedCommand, this.options.name));
      return;
    }
    if (remainingArgs.includes('--version') || remainingArgs.includes('-v')) {
      this.showVersion();
      return;
    }

    // Parse CLI args
    const optionsDef = def.options ?? {};
    const cliParsedOptions = parseArgs(remainingArgs, optionsDef);

    // Load config and env
    if (!this.loadedConfig || Object.keys(this.loadedConfig).length === 0) {
      const configResult = loadConfig(this.options.name);
      this.loadedConfig = configResult.values;
    }
    const prefix = envPrefix(this.options.name);
    const envValues = loadEnv(prefix);

    // Merge: CLI args > env > config > defaults
    const finalOptions = resolveOptions(cliParsedOptions, envValues, this.loadedConfig, optionsDef);

    // Run hooks
    for (const plugin of this.plugins) {
      if (plugin.hooks?.['before:run']) {
        await plugin.hooks['before:run']({ name: cmdName, args: remainingArgs });
      }
    }

    try {
      await def.run({
        options: finalOptions,
        ui: ui as unknown as import('@cliffx/ui').Ui,
        config: this.loadedConfig,
        args: remainingArgs,
        cli: this,
      });
    } catch (err) {
      for (const plugin of this.plugins) {
        if (plugin.hooks?.['on:error']) {
          await plugin.hooks['on:error'](err as Error);
        }
      }
      this.handleError(err);
    }

    for (const plugin of this.plugins) {
      if (plugin.hooks?.['after:run']) {
        await plugin.hooks['after:run']({ name: cmdName, args: remainingArgs });
      }
    }
  }

  private showRootHelp(): void {
    const cmds = this.getCommands()
      .filter((c) => !c.def.hidden && !c.parentName)
      .map((c) => ({ name: c.def.name, description: c.def.description }));
    process.stderr.write(
      generateRootHelp(
        this.options.name,
        this.options.version,
        this.options.description,
        cmds,
      ),
    );
  }

  private showVersion(): void {
    process.stderr.write(`${this.options.version ?? '0.0.0'}\n`);
  }

  private handleError(err: unknown): void {
    if (err instanceof Error) {
      ui.error(err.message);
      if (this.options.debug) {
        process.stderr.write(err.stack ?? '');
      }
    } else {
      ui.error(String(err));
    }
    process.exit(1);
  }
}

/** Create a new CLI instance. */
export function createCli(options: CliOptions): Cli {
  return new Cli(options);
}
