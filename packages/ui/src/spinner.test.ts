 import { describe, it, expect } from 'vitest';
 import { Spinner, spinner } from './spinner';
 import { stripColor } from './color';
 
 function captureStderr(fn: () => void | Promise<void>): string {
   let output = '';
   const orig = process.stderr.write.bind(process.stderr);
   process.stderr.write = ((chunk: unknown) => {
     output += String(chunk);
     return true;
   }) as typeof process.stderr.write;
   try {
     const result = fn();
     if (result instanceof Promise) {
       // For async - return early capture, test will process
     }
   } finally {
     process.stderr.write = orig;
   }
   return output;
 }
 
 describe('spinner', () => {
   it('spinner function runs and returns result', async () => {
     const result = await spinner('Loading...', async () => {
       return 42;
     });
     expect(result).toBe(42);
   });
 
   it('spinner function calls succeed on completion', async () => {
     let output = '';
     const orig = process.stderr.write.bind(process.stderr);
     process.stderr.write = ((chunk: unknown) => {
       output += String(chunk);
       return true;
     }) as typeof process.stderr.write;
 
     await spinner('Test', async () => {
       // Let the spinner render at least one frame
       await new Promise((r) => setTimeout(r, 100));
     });
 
     process.stderr.write = orig;
     const plain = stripColor(output);
     expect(plain).toContain('Test');
     expect(plain).toContain('done');
   });
 
   it('spinner function calls fail on error', async () => {
     let output = '';
     const orig = process.stderr.write.bind(process.stderr);
     process.stderr.write = ((chunk: unknown) => {
       output += String(chunk);
       return true;
     }) as typeof process.stderr.write;
 
     try {
       await spinner('Test', async () => {
         await new Promise((r) => setTimeout(r, 50));
         throw new Error('boom');
       });
     } catch {
       // Expected
     }
 
     process.stderr.write = orig;
     const plain = stripColor(output);
     expect(plain).toContain('Test');
     expect(plain).toContain('failed');
   });
 
   it('Spinner class can be started and stopped', () => {
     const s = new Spinner('Working');
     s.start();
     expect(s).toBeDefined();
     s.stop();
   });
 
   it('Spinner succeed writes done message', () => {
     let output = '';
     const orig = process.stderr.write.bind(process.stderr);
     process.stderr.write = ((chunk: unknown) => {
       output += String(chunk);
       return true;
     }) as typeof process.stderr.write;
 
     const s = new Spinner('Working');
     s.start();
     s.succeed();
     process.stderr.write = orig;
     const plain = stripColor(output);
     expect(plain).toContain('Working');
     expect(plain).toContain('done');
   });
 
   it('Spinner fail writes failed message', () => {
     let output = '';
     const orig = process.stderr.write.bind(process.stderr);
     process.stderr.write = ((chunk: unknown) => {
       output += String(chunk);
       return true;
     }) as typeof process.stderr.write;
 
     const s = new Spinner('Working');
     s.start();
     s.fail();
     process.stderr.write = orig;
     const plain = stripColor(output);
     expect(plain).toContain('Working');
     expect(plain).toContain('failed');
   });
 
   it('Spinner setText updates text', () => {
     const s = new Spinner('Initial');
     s.start();
     s.setText('Updated');
     s.stop();
     // No crash is success
   });
 });
