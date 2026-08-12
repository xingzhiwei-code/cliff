// @cliff/core — Command system, parser, plugin engine
export { defineCommand } from './command';
export { definePlugin, discoverPlugins } from './plugin';
export { Cli, createCli } from './cli';
export { parseArgs } from './parser';
export { generateHelp, generateRootHelp } from './help';
export { prettyError, getErrorHint } from './error';
export { checkForUpdates } from './update';
export { generateManPage, printManPage } from './man';
export { generateCompletion, printCompletion } from './completion';
export { loadConfig, loadEnv, envPrefix, resolveOptions } from './config';
export type { ConfigResult } from './config';
export type {
  Command, CommandDef, OptionsDef, OptionDef, OptionType,
  RunContext, ResolvedOptions, Plugin, CliOptions,
} from './types';
