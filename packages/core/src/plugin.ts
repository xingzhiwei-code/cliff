import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from './types';

/**
 * Define a plugin with full type safety.
 * Works like `defineCommand` but for plugins.
 *
 * @example
 * ```ts
 * export default definePlugin({
 *   name: '@my-tool/plugin-docker',
 *   commands: { ... },
 *   hooks: { ... },
 * });
 * ```
 */
export function definePlugin(plugin: Plugin): Plugin {
  return plugin;
}

/**
 * Discover plugins from a directory.
 * Scans .ts and .js files whose names start with `plugin-` or `plugin.`,
 * and any directory whose name starts with `plugin-`.
 */
export async function discoverPlugins(baseDir: string, pluginsDir = 'plugins'): Promise<Plugin[]> {
  const dir = join(baseDir, pluginsDir);
  if (!existsSync(dir)) return [];

  const plugins: Plugin[] = [];
  await scanPluginDir(dir, plugins);
  return plugins;

  async function scanPluginDir(currentDir: string, result: Plugin[]): Promise<void> {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const fsStat = statSync(fullPath);

      if (fsStat.isDirectory()) {
        await scanPluginDir(fullPath, result);
      } else if (fsStat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.js'))) {
        const mod = await loadModule(fullPath);
        const plugin = extractPlugin(mod);
        if (plugin) {
          result.push(plugin);
        }
      }
    }
  }
}

async function loadModule(filePath: string): Promise<Record<string, unknown>> {
  const url = pathToFileURL(filePath).href;
  return await import(url);
}

function extractPlugin(mod: Record<string, unknown>): Plugin | null {
  const exported = mod.default || Object.values(mod).find(
    (v): v is Plugin =>
      typeof v === 'object' && v !== null && 'name' in v && 'commands' in v,
  );

  if (!exported || typeof exported !== 'object' || exported === null) return null;
  const candidate = exported as Plugin;
  if (!candidate.name) return null;
  return candidate;
}
