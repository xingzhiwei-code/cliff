 import type { Command, CommandDef, OptionsDef } from './types';
 
 /**
  * Define a command with full type inference for options.
  *
  * @example
  * ```ts
  * export default defineCommand({
  *   name: 'deploy',
  *   options: { env: { type: 'string', default: 'staging' } },
  *   async run({ options }) {
  *     console.log(options.env); // typed as string
  *   },
  * });
  * ```
  */
 export function defineCommand<TOptions extends OptionsDef>(
   def: CommandDef<TOptions>,
 ): Command<TOptions> {
   return { def };
 }
