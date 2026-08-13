 /** Supported option types. */
 export type OptionType = 'string' | 'boolean' | 'number' | 'enum';
 
 /** Definition of a single option. */
 export interface OptionDef<T = unknown> {
   type: OptionType;
   default?: T;
   description?: string;
   /** For enum type: list of allowed values. */
   choices?: string[];
   /** Short alias, e.g. 'e' for --env. */
   alias?: string;
   /** Hide from --help output. */
   hidden?: boolean;
 }
 
 /** Map of option name to definition. */
 export type OptionsDef = Record<string, OptionDef>;
 
 /** Runtime context passed to the command's run function. */
 export interface RunContext<TOptions extends OptionsDef = OptionsDef> {
   /** Resolved options with defaults applied. */
   options: ResolvedOptions<TOptions>;
   /** UI toolkit for output and interaction. */
   ui: import('@cliffx/ui').Ui;
   /** Loaded config (from file + env). */
   config: Record<string, unknown>;
   /** Raw CLI arguments. */
   args: string[];
   /** The CLI instance. */
   cli: import('./cli').Cli;
 }
 
 /** Extract resolved option types from definitions. */
 export type ResolvedOptions<T extends OptionsDef> = {
   [K in keyof T]: T[K] extends { type: 'string'; default: infer _D }
     ? string
     : T[K] extends { type: 'boolean'; default: infer _D }
       ? boolean
       : T[K] extends { type: 'number'; default: infer _D }
         ? number
         : T[K] extends { type: 'enum'; choices: infer C }
           ? C extends (infer V)[] ? V : string
           : unknown;
 };
 
 /** Definition of a command. */
 export interface CommandDef<TOptions extends OptionsDef = OptionsDef> {
   name: string;
   description?: string;
   /** Long-form help text shown after description in --help. */
   help?: string;
   options?: TOptions;
   /** Usage examples shown in --help. */
   examples?: string[];
   /** Hidden from --help and completion. */
   hidden?: boolean;
   run: (ctx: RunContext<TOptions>) => Promise<void> | void;
 }
 
 /** A command constructed by defineCommand. */
 export interface Command<TOptions extends OptionsDef = OptionsDef> {
   def: CommandDef<TOptions>;
   filePath?: string;
   parentName?: string;
 }
 
 /** Plugin definition. */
 export interface Plugin {
   name: string;
   commands?: Record<string, CommandDef>;
   hooks?: {
     'before:run'?: (ctx: { name: string; args: string[] }) => Promise<void>;
     'after:run'?: (ctx: { name: string; args: string[] }) => Promise<void>;
     'on:error'?: (err: Error) => Promise<void>;
   };
 }
 
 /** CLI configuration options. */
 export interface CliOptions {
   /** CLI name, e.g. 'my-tool'. */
   name: string;
   /** Version string. */
   version?: string;
   /** Description shown in top-level help. */
   description?: string;
   /** Directory to scan for commands (relative to project root). */
   commandsDir?: string;
  /** Directory to scan for plugins (relative to project root). */
  pluginsDir?: string;
   /** Plugins to load. */
   plugins?: Plugin[];
   /** Enable debug mode. */
   debug?: boolean;
 }
