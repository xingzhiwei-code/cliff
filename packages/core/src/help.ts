 import { c, dim } from '@cliff/ui';
 import type { Command } from './types';
 
 /** Generate formatted help text for a command. */
 export function generateHelp(
   command: Command,
   cliName: string,
   isRoot = false,
 ): string {
   const { def } = command;
   const lines: string[] = [];
   const fullName = command.parentName
     ? `${cliName} ${command.parentName} ${def.name}`
     : `${cliName} ${def.name}`;
 
   // Usage
   lines.push('');
   lines.push(c(fullName).bold().brightBlue().toString());
   if (def.description) {
     lines.push(`  ${def.description}`);
   }
 
   // Usage line
   const optionFlags = def.options
     ? Object.entries(def.options)
         .filter(([, d]) => !d.hidden)
         .map(([k]) => (def.options![k]!.type === 'boolean' ? `[--${k}]` : `[--${k} <value>]`))
         .join(' ')
     : '';
   lines.push('');
   lines.push(c('Usage:').bold().toString());
   lines.push(`  $ ${fullName} ${optionFlags}`.trimEnd());
 
   // Options
   if (def.options && Object.keys(def.options).length > 0) {
     lines.push('');
     lines.push(c('Options:').bold().toString());
     for (const [key, opt] of Object.entries(def.options)) {
       if (opt.hidden) continue;
       const alias = opt.alias ? `-${opt.alias}, ` : '';
       const flag = `  ${alias}--${key}`;
       const typeHint =
         opt.type === 'enum' && opt.choices
           ? ` <${opt.choices.join('|')}>`
           : opt.type !== 'boolean'
             ? ` <${opt.type}>`
             : '';
       const desc = opt.description ? `  ${dim(opt.description)}` : '';
       const defVal =
         opt.default !== undefined
           ? ` ${dim(`(default: ${JSON.stringify(opt.default)})`)}`
           : '';
       lines.push(`${flag}${typeHint}${desc}${defVal}`);
     }
   }
 
   // Examples
   if (def.examples && def.examples.length > 0) {
     lines.push('');
     lines.push(c('Examples:').bold().toString());
     for (const ex of def.examples) {
       lines.push(`  ${dim(`$ ${ex}`)}`);
     }
   }
 
   // Subcommands (if root)
   if (isRoot && def.help) {
     lines.push('');
     lines.push(def.help);
   }
 
   lines.push('');
   return lines.join('\n') + '\n';
 }
 
 /** Generate top-level help listing all commands. */
 export function generateRootHelp(
   cliName: string,
   version: string | undefined,
   description: string | undefined,
   commands: { name: string; description?: string }[],
 ): string {
   const lines: string[] = [];
 
   lines.push('');
   lines.push(c(cliName).bold().brightBlue().toString());
   if (version) {
     lines.push(`  ${dim(`v${version}`)}`);
   }
   if (description) {
     lines.push(`  ${description}`);
   }
 
   lines.push('');
   lines.push(c('Usage:').bold().toString());
   lines.push(`  $ ${cliName} <command> [options]`);
 
   if (commands.length > 0) {
     lines.push('');
     lines.push(c('Commands:').bold().toString());
 
     // Calculate max name width for alignment
     const maxLen = Math.max(...commands.map((c) => c.name.length));
     for (const cmd of commands) {
       const padded = cmd.name.padEnd(maxLen + 2);
       const desc = cmd.description ? dim(cmd.description) : '';
       lines.push(`  ${c(padded).cyan().toString()}${desc}`);
     }
   }
 
   lines.push('');
   lines.push(`  Run ${dim(`${cliName} <command> --help`)} for more info.`);
   lines.push('');
 
   return lines.join('\n') + '\n';
 }
