 import { describe, it, expect } from 'vitest';
 import { table } from './table';
 import { stripColor } from './color';
 
 function captureStdout(fn: () => void): string {
   let output = '';
   const orig = process.stdout.write.bind(process.stdout);
   process.stdout.write = ((chunk: unknown) => {
     output += String(chunk);
     return true;
   }) as typeof process.stdout.write;
   try {
     fn();
   } finally {
     process.stdout.write = orig;
   }
   return output;
 }
 
 describe('table', () => {
   it('renders a table with headers and data rows', () => {
     const data = [{ name: 'app.js', size: '2.3MB' }];
     const output = captureStdout(() => table(data, ['name', 'size']));
     const plain = stripColor(output);
 
     expect(plain).toContain('app.js');
     expect(plain).toContain('2.3MB');
     expect(plain).toContain('name');
     expect(plain).toContain('size');
   });
 
   it('renders custom headers', () => {
     const data = [{ key: 'env', value: 'staging' }];
     const output = captureStdout(() =>
       table(data, ['key', 'value'], { headers: ['Setting', 'Value'] }),
     );
     const plain = stripColor(output);
 
     expect(plain).toContain('Setting');
     expect(plain).toContain('Value');
     expect(plain).toContain('env');
     expect(plain).toContain('staging');
   });
 
   it('handles empty data gracefully', () => {
     const output = captureStdout(() => table([], ['name', 'size']));
     expect(output).toBe('');
   });
 
   it('renders box-drawing borders', () => {
     const data = [{ a: '1' }];
     const output = captureStdout(() => table(data, ['a']));
 
     expect(output).toContain('┌');
     expect(output).toContain('┐');
     expect(output).toContain('└');
     expect(output).toContain('┘');
     expect(output).toContain('├');
     expect(output).toContain('┤');
   });
 });
