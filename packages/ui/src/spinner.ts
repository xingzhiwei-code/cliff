 import { cyan, gray } from './color';
 
 const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
 
 /** A terminal spinner for async operations. */
 export class Spinner {
   private interval: NodeJS.Timeout | null = null;
   private frameIndex = 0;
   private isRunning = false;
 
   constructor(private text: string = '') {}
 
   /** Start the spinner and return the instance. */
   start(text?: string): this {
     if (text) this.text = text;
     if (this.isRunning) return this;
     this.isRunning = true;
     this.render();
     this.interval = setInterval(() => {
       this.frameIndex = (this.frameIndex + 1) % frames.length;
       this.render();
     }, 80);
     return this;
   }
 
   /** Stop the spinner with a success message. */
   succeed(text?: string): void {
     this.stop();
     process.stderr.write(`${cyan('✔')} ${text ?? this.text} ${gray('done')}\n`);
   }
 
   /** Stop the spinner with a failure message. */
   fail(text?: string): void {
     this.stop();
     process.stderr.write(`${cyan('✖')} ${text ?? this.text} ${gray('failed')}\n`);
   }
 
   /** Stop the spinner without a message. */
   stop(): void {
     if (this.interval) clearInterval(this.interval);
     this.interval = null;
     this.isRunning = false;
     this.clearLine();
   }
 
   /** Update the spinner text while running. */
   setText(text: string): void {
     this.text = text;
     if (this.isRunning) this.render();
   }
 
   private render(): void {
     this.clearLine();
     process.stderr.write(`${cyan(frames[this.frameIndex]!)} ${this.text}`);
   }
 
   private clearLine(): void {
     process.stderr.write('\r\x1b[K');
   }
 }
 
 /**
  * Run an async function with a spinner showing the given text.
  * Returns the result of the function.
  */
 export async function spinner<T>(
   text: string,
   fn: () => Promise<T>,
 ): Promise<T> {
   const spinner = new Spinner(text).start();
   try {
     const result = await fn();
     spinner.succeed(text);
     return result;
   } catch (err) {
     spinner.fail(text);
     throw err;
   }
 }
