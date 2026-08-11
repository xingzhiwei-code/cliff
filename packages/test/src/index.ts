 // @cliff/test — Test utilities for CLI tools
 import { Cli } from '@cliff/core';
 import type { CommandDef, CliOptions } from '@cliff/core';
 
 /** Options for creating a test app. */
 export interface TestAppOptions {
   /** Commands to register. */
   commands?: CommandDef[];
   /** CLI options. */
   cliOptions?: Partial<CliOptions>;
 }
 
 /** Result of running a test app. */
 export interface RunResult {
   stdout: string;
   stderr: string;
   exitCode: number;
 }
 
 /**
  * Create a test CLI app for integration testing.
  * Captures stdout and stderr instead of writing to the terminal.
  */
 export function createTestApp(options: TestAppOptions = {}) {
   const cli = new Cli({
     name: options.cliOptions?.name ?? 'test-cli',
     version: options.cliOptions?.version ?? '0.0.0',
     ...options.cliOptions,
   });
 
   if (options.commands) {
     for (const cmd of options.commands) {
       cli.register(cmd);
     }
   }
 
   return {
     cli,
 
     /**
      * Run the CLI with given arguments and capture output.
      * Simulates terminal interaction by redirecting stdout/stderr.
      */
     async run(args: string[]): Promise<RunResult> {
       let stdout = '';
       let stderr = '';
       let exitCode = 0;
 
       const origStdout = process.stdout.write.bind(process.stdout);
       const origStderr = process.stderr.write.bind(process.stderr);
       const origExit = process.exit.bind(process);
 
       process.stdout.write = ((chunk: unknown) => {
         stdout += String(chunk);
         return true;
       }) as typeof process.stdout.write;
 
       process.stderr.write = ((chunk: unknown) => {
         stderr += String(chunk);
         return true;
       }) as typeof process.stderr.write;
 
       process.exit = ((code?: number) => {
         exitCode = code ?? 0;
         throw new TestExitError(exitCode);
       }) as typeof process.exit;
 
       try {
         await cli.run(args);
       } catch (err) {
         if (!(err instanceof TestExitError)) throw err;
       } finally {
         process.stdout.write = origStdout;
         process.stderr.write = origStderr;
         process.exit = origExit;
       }
 
       return { stdout, stderr, exitCode };
     },
   };
 }
 
 /** Internal error to signal process.exit in test mode. */
 class TestExitError extends Error {
   constructor(public code: number) {
     super(`TestExit: ${code}`);
   }
 }
