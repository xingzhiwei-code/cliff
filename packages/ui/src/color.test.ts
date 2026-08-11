 import { describe, it, expect } from 'vitest';
 import { c, red, green, supportsColor, stripColor, visibleLength } from './color';
 
 describe('color', () => {
   it('red returns ANSI-wrapped text', () => {
     const result = red('hello');
     expect(result).toContain('\x1b[31m');
     expect(result).toContain('hello');
     expect(result).toContain('\x1b[0m');
   });
 
   it('c chains multiple styles', () => {
     const result = c('hello').red().bold().toString();
     expect(result).toContain('31;1');
     expect(result).toContain('hello');
     expect(result).toContain('\x1b[0m');
   });
 
   it('stripColor removes ANSI codes', () => {
     expect(stripColor(red('hello'))).toBe('hello');
     expect(stripColor(c('x').red().bold().toString())).toBe('x');
     expect(stripColor('plain')).toBe('plain');
   });
 
   it('visibleLength measures without ANSI codes', () => {
     expect(visibleLength(red('hello'))).toBe(5);
     expect(visibleLength('hello')).toBe(5);
   });
 
   it('supportsColor returns boolean', () => {
     expect(typeof supportsColor()).toBe('boolean');
   });
 
   it('green returns ANSI-wrapped text', () => {
     expect(green('ok')).toContain('\x1b[32m');
   });
 });
