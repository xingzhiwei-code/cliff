 import type { Command } from './types';
 
 /**
  * Generate shell completion script for the given shell.
  * Supports bash, zsh, and fish.
  */
 export function generateCompletion(
   cliName: string,
   commands: Command[],
   shell: 'bash' | 'zsh' | 'fish',
 ): string {
   switch (shell) {
     case 'bash': return generateBash(cliName, commands);
     case 'zsh': return generateZsh(cliName, commands);
     case 'fish': return generateFish(cliName, commands);
   }
 }
 
 function generateBash(cliName: string, commands: Command[]): string {
   const cmdNames = getAllCommandNames(commands);
   const lines: string[] = [];
 
   lines.push(`# ${cliName} completion for bash`);
   lines.push(`_${cliName.replace(/-/g, '_')}_completion() {`);
   lines.push(`  local cur prev words cword`);
   lines.push(`  _init_completion || return`);
   lines.push('');
   lines.push(`  COMPREPLY=()`);
   lines.push(`  cur="\${COMP_WORDS[COMP_CWORD]}"`);
   lines.push(`  prev="\${COMP_WORDS[COMP_CWORD-1]}"`);
   lines.push('');
   lines.push(`  # If completing a command name (first positional) or subcommand`);
   lines.push(`  local cmd_list="${cmdNames.join(' ')}"`);
   lines.push(`  if [[ \$COMP_CWORD -eq 1 ]]; then`);
   lines.push(`    COMPREPLY=(\$(compgen -W "\$cmd_list" -- "\$cur"))`);
   lines.push(`    return 0`);
   lines.push(`  fi`);
 
   // Generate per-command option completions
   for (const cmd of commands) {
     const { def } = cmd;
     if (def.hidden) continue;
  
     lines.push(`  if [[ "\${COMP_WORDS[1]}" == "${def.name}" ]]; then`);
     if (def.options) {
       const opts = collectOptions(def.options);
       lines.push(`    COMPREPLY=(\$(compgen -W "${opts}" -- "\$cur"))`);
       lines.push(`    return 0`);
     }
     lines.push(`  fi`);
   }
 
   lines.push(`  COMPREPLY=(\$(compgen -W "\$cmd_list" -- "\$cur"))`);
   lines.push(`  return 0`);
   lines.push(`}`);
   lines.push(`complete -F _${cliName.replace(/-/g, '_')}_completion ${cliName}`);
   lines.push('');
 
   return lines.join('\n');
 }
 
 function generateZsh(cliName: string, commands: Command[]): string {
   const cmdNames = getAllCommandNames(commands);
   const lines: string[] = [];
 
   lines.push(`#compdef ${cliName}`);
   lines.push(`# ${cliName} completion for zsh`);
   lines.push(`_${cliName.replace(/-/g, '_')}() {`);
   lines.push(`  local -a commands`);
   lines.push(`  commands=(${cmdNames.map((c) => `'${c}'`).join(' ')})`);
   lines.push('');
   lines.push(`  _arguments -C \\`);
   lines.push(`    '1: :->cmds' \\`);
   lines.push(`    '*::arg:->args'`);
   lines.push('');
   lines.push(`  case "\$state" in`);
   lines.push(`    cmds)`);
   lines.push(`      _describe 'command' commands`);
   lines.push(`      ;;`);
   lines.push(`    args)`);
 
   for (const cmd of commands) {
     const { def } = cmd;
     if (def.hidden) continue;
     if (def.options) {
       const opts = collectZshOptions(def.options);
       lines.push(`      if [[ "\${words[1]}" == "${def.name}" ]]; then`);
       lines.push(`        _arguments ${opts}`);
       lines.push(`      fi`);
     }
   }
 
   lines.push(`      ;;`);
   lines.push(`  esac`);
   lines.push(`}`);
   lines.push(`_${cliName.replace(/-/g, '_')} "\$@"`);
   lines.push('');
 
   return lines.join('\n');
 }
 
 function generateFish(cliName: string, commands: Command[]): string {
   const cmdNames = getAllCommandNames(commands);
   const lines: string[] = [];
 
   lines.push(`# ${cliName} completion for fish`);
   lines.push(`set -l commands ${cmdNames.join(' ')}`);
   lines.push('');
 
   for (const cmd of commands) {
     const { def } = cmd;
     if (def.hidden) continue;
     if (def.options) {
       const opts = collectFishOptions(def.options);
       lines.push(`complete -c ${cliName} -n "__fish_seen_subcommand_from ${def.name}" ${opts}`);
     }
   }
 
   lines.push(`complete -c ${cliName} -n "__fish_use_subcommand" -a "\$commands"`);
   lines.push('');
 
   return lines.join('\n');
 }
 
 function getAllCommandNames(commands: Command[]): string[] {
   return commands
     .filter((c) => !c.def.hidden)
     .map((c) => (c.parentName ? `${c.parentName} ${c.def.name}` : c.def.name));
 }
 
 function collectOptions(options: Record<string, { type: string; alias?: string; description?: string; hidden?: boolean }>): string {
   return Object.entries(options)
     .filter(([, o]) => !o.hidden)
     .map(([k, o]) => {
       const flags = [`--${k}`];
       if (o.alias) flags.push(`-${o.alias}`);
       return flags.join(' ');
     })
     .join(' ');
 }
 
 function collectZshOptions(options: Record<string, { type: string; alias?: string; description?: string; hidden?: boolean }>): string {
   return Object.entries(options)
     .filter(([, o]) => !o.hidden)
     .map(([k, o]) => {
       const parts: string[] = [];
       if (o.alias) {
         parts.push(`'-${o.alias}[${o.description ?? ''}]'`);
       }
       parts.push(`'--${k}[${o.description ?? ''}]'`);
       return parts.join(' ');
     })
     .join(' \\\n        ');
 }
 
 function collectFishOptions(options: Record<string, { type: string; alias?: string; description?: string; hidden?: boolean }>): string {
   return Object.entries(options)
     .filter(([, o]) => !o.hidden)
     .map(([k, o]) => {
       const parts: string[] = [];
       parts.push(`-l ${k}`);
       if (o.alias) parts.push(`-s ${o.alias}`);
       if (o.description) parts.push(`-d '${o.description}'`);
       return parts.join(' ');
     })
     .join(' ');
 }
 
 /**
  * Print the completion script for the given shell.
  * Call this from a 'completion' command in your CLI.
  */
 export function printCompletion(
   cliName: string,
   commands: Command[],
   shell: 'bash' | 'zsh' | 'fish',
 ): void {
   process.stdout.write(generateCompletion(cliName, commands, shell));
 }
