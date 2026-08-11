 import { describe, it, expect } from 'vitest';
 import { parseArgs } from './parser';
 import type { OptionsDef } from './types';
 
 describe('parseArgs', () => {
   it('returns defaults when no args provided', () => {
     const opts: OptionsDef = {
       env: { type: 'string', default: 'staging' },
       force: { type: 'boolean', default: false },
     };
     const result = parseArgs([], opts);
     expect(result).toEqual({ env: 'staging', force: false });
   });
 
   it('parses --key value pairs', () => {
     const opts: OptionsDef = {
       env: { type: 'string', default: 'staging' },
     };
     const result = parseArgs(['--env', 'production'], opts);
     expect(result).toEqual({ env: 'production' });
   });
 
   it('parses --key=value syntax', () => {
     const opts: OptionsDef = {
       env: { type: 'string', default: 'staging' },
     };
     const result = parseArgs(['--env=production'], opts);
     expect(result).toEqual({ env: 'production' });
   });
 
   it('parses boolean flags', () => {
     const opts: OptionsDef = {
       force: { type: 'boolean', default: false },
     };
     const result = parseArgs(['--force'], opts);
     expect(result).toEqual({ force: true });
   });
 
   it('parses --no- prefix for booleans', () => {
     const opts: OptionsDef = {
       force: { type: 'boolean', default: true },
     };
     const result = parseArgs(['--no-force'], opts);
     expect(result).toEqual({ force: false });
   });
 
   it('parses short aliases', () => {
     const opts: OptionsDef = {
       env: { type: 'string', default: 'staging', alias: 'e' },
     };
     const result = parseArgs(['-e', 'production'], opts);
     expect(result).toEqual({ env: 'production' });
   });
 
   it('parses number types', () => {
     const opts: OptionsDef = {
       count: { type: 'number', default: 0 },
     };
     const result = parseArgs(['--count', '42'], opts);
     expect(result).toEqual({ count: 42 });
   });
 
   it('throws on invalid number', () => {
     const opts: OptionsDef = {
       count: { type: 'number', default: 0 },
     };
     expect(() => parseArgs(['--count', 'abc'], opts)).toThrow('Expected a number');
   });
 
   it('parses enum with valid choices', () => {
     const opts: OptionsDef = {
       level: { type: 'enum', choices: ['debug', 'info', 'error'], default: 'info' },
     };
     const result = parseArgs(['--level', 'debug'], opts);
     expect(result).toEqual({ level: 'debug' });
   });
 
   it('throws on invalid enum value', () => {
     const opts: OptionsDef = {
       level: { type: 'enum', choices: ['debug', 'info'], default: 'info' },
     };
     expect(() => parseArgs(['--level', 'critical'], opts)).toThrow();
   });
 });
