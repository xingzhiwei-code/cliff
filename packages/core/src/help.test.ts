 import { describe, it, expect } from 'vitest';
 import { generateHelp, generateRootHelp } from './help';
 import { stripColor } from '@cliff/ui';
 import type { Command } from './types';
 
 describe('generateHelp', () => {
   it('includes command name and description', () => {
     const cmd: Command = {
       def: { name: 'deploy', description: 'Deploy to production' },
     };
     const output = generateHelp(cmd, 'my-tool');
     const plain = stripColor(output);
     expect(plain).toContain('my-tool deploy');
     expect(plain).toContain('Deploy to production');
   });
 
   it('includes usage line', () => {
     const cmd: Command = {
       def: { name: 'deploy', description: 'Deploy' },
     };
     const output = generateHelp(cmd, 'my-tool');
     const plain = stripColor(output);
     expect(plain).toContain('Usage:');
     expect(plain).toContain('$ my-tool deploy');
   });
 
   it('lists options', () => {
     const cmd: Command = {
       def: {
         name: 'deploy',
         options: {
           env: { type: 'string', default: 'staging', description: 'Target env' },
           force: { type: 'boolean', default: false },
         },
       },
     };
     const output = generateHelp(cmd, 'my-tool');
     const plain = stripColor(output);
     expect(plain).toContain('--env');
     expect(plain).toContain('Target env');
     expect(plain).toContain('--force');
     expect(plain).toContain('staging');
   });
 
   it('shows option aliases', () => {
     const cmd: Command = {
       def: {
         name: 'deploy',
         options: {
           env: { type: 'string', alias: 'e', description: 'Target' },
         },
       },
     };
     const output = generateHelp(cmd, 'my-tool');
     const plain = stripColor(output);
     expect(plain).toContain('-e, --env');
   });
 
   it('hides hidden options', () => {
     const cmd: Command = {
       def: {
         name: 'deploy',
         options: {
           visible: { type: 'string' },
           secret: { type: 'string', hidden: true },
         },
       },
     };
     const output = generateHelp(cmd, 'my-tool');
     const plain = stripColor(output);
     expect(plain).toContain('--visible');
     expect(plain).not.toContain('--secret');
   });
 
   it('shows examples', () => {
     const cmd: Command = {
       def: {
         name: 'deploy',
         examples: ['my-tool deploy --env prod'],
       },
     };
     const output = generateHelp(cmd, 'my-tool');
     const plain = stripColor(output);
     expect(plain).toContain('Examples:');
     expect(plain).toContain('my-tool deploy --env prod');
   });
 });
 
 describe('generateRootHelp', () => {
   it('includes CLI name and version', () => {
     const output = generateRootHelp('my-tool', '1.0.0', 'A CLI tool', []);
     const plain = stripColor(output);
     expect(plain).toContain('my-tool');
     expect(plain).toContain('v1.0.0');
     expect(plain).toContain('A CLI tool');
   });
 
   it('lists commands', () => {
     const output = generateRootHelp('my-tool', '1.0.0', '', [
       { name: 'deploy', description: 'Deploy' },
       { name: 'config', description: 'Config' },
     ]);
     const plain = stripColor(output);
     expect(plain).toContain('deploy');
     expect(plain).toContain('Deploy');
     expect(plain).toContain('config');
     expect(plain).toContain('Config');
   });
 
   it('includes usage hint', () => {
     const output = generateRootHelp('my-tool', '1.0.0', '', []);
     const plain = stripColor(output);
     expect(plain).toContain('Usage:');
     expect(plain).toContain('my-tool <command>');
   });
 });
