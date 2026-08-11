 import { green, red, yellow, blue, gray, dim, c, visibleLength } from './color';
 
 /** Write a standard log message to stderr. */
 export function log(message: string): void {
   process.stderr.write(`${dim('│')} ${message}\n`);
 }
 
 /** Write a success message with a green checkmark. */
 export function success(message: string): void {
   process.stderr.write(`${green('✔')} ${message}\n`);
 }
 
 /** Write a warning message with a yellow warning sign. */
 export function warn(message: string): void {
   process.stderr.write(`${yellow('⚠')} ${message}\n`);
 }
 
 /** Write an error message with a red cross. */
 export function error(message: string): void {
   process.stderr.write(`${red('✖')} ${message}\n`);
 }
 
 /** Write an info message with a blue info sign. */
 export function info(message: string): void {
   process.stderr.write(`${blue('ℹ')} ${message}\n`);
 }
 
 /** Write a section header with a styled title. */
 export function section(title: string): void {
   process.stderr.write(`\n${c(title).bold().brightBlue()}\n`);
   process.stderr.write(`${gray('─'.repeat(visibleLength(title)))}\n`);
 }
 
 /** Write a newline. */
 export function newline(): void {
   process.stderr.write('\n');
 }
 
 /**
  * Write data to stdout (for piping). Use this for command results,
  * not for status messages.
  */
 export function stdout(message: string): void {
   process.stdout.write(`${message}\n`);
 }
