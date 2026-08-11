 import { describe, it, expect } from 'vitest';
 import { generateCompletion } from './completion';
 import type { Command } from './types';
 
 const commands: Command[] = [
   {
     def: { name: 'deploy', description: 'Deploy', options: { env: { type: 'string', alias: 'e', description: 'Target' } } },
   },
   {
     def: { name: 'config', description: 'Config' },
   },
 ];
 
 describe('generateCompletion', () => {
   it('generates bash completion script', () => {
     const output = generateCompletion('my-tool', commands, 'bash');
     expect(output).toContain('_my_tool_completion');
     expect(output).toContain('complete -F');
     expect(output).toContain('deploy');
     expect(output).toContain('config');
     expect(output).toContain('--env');
   });
 
   it('generates zsh completion script', () => {
     const output = generateCompletion('my-tool', commands, 'zsh');
     expect(output).toContain('#compdef my-tool');
     expect(output).toContain('_my_tool');
     expect(output).toContain('deploy');
     expect(output).toContain('config');
     expect(output).toContain('--env');
   });
 
   it('generates fish completion script', () => {
     const output = generateCompletion('my-tool', commands, 'fish');
     expect(output).toContain('complete -c my-tool');
     expect(output).toContain('deploy');
     expect(output).toContain('config');
     expect(output).toContain('-l env');
     expect(output).toContain('-s e');
   });
 
   it('respects hidden commands and options', () => {
     const cmds: Command[] = [
       { def: { name: 'visible', options: { flag: { type: 'boolean' } } } },
       { def: { name: 'hidden', hidden: true, options: { secret: { type: 'string' } } } },
     ];
     const output = generateCompletion('test', cmds, 'bash');
     expect(output).toContain('visible');
     expect(output).not.toContain('hidden');
   });
 });
