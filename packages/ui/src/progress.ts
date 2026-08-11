 import { cyan, gray, dim } from './color';
 
 /** Configuration for a progress bar. */
 export interface ProgressOptions {
   /** Total number of items/steps. */
   total: number;
   /** Width of the progress bar in characters. Default: 30. */
   width?: number;
   /** Label shown next to the bar. */
   label?: string;
 }
 
 /** A terminal progress bar. */
 export class Progress {
   private current = 0;
   private total: number;
   private width: number;
   private label: string;
   private startTime: number;
   private isDone = false;
 
   constructor(options: ProgressOptions) {
     this.total = options.total;
     this.width = options.width ?? 30;
     this.label = options.label ?? '';
     this.startTime = Date.now();
   }
 
   /** Advance the progress by `n` steps. */
   tick(n = 1): void {
     this.current = Math.min(this.current + n, this.total);
     this.render();
   }
 
   /** Set the current value directly. */
   update(value: number): void {
     this.current = Math.min(value, this.total);
     this.render();
   }
 
   /** Mark the progress as complete. */
   complete(): void {
     this.current = this.total;
     this.isDone = true;
     this.render();
     process.stderr.write('\n');
   }
 
   private render(): void {
     const pct = this.total === 0 ? 1 : this.current / this.total;
     const filled = Math.round(pct * this.width);
     const empty = this.width - filled;
     const bar = cyan('█'.repeat(filled)) + gray('░'.repeat(empty));
     const elapsed = this.formatTime(Date.now() - this.startTime);
     const status = this.isDone ? cyan('done') : `${Math.round(pct * 100)}%`;
 
     process.stderr.write('\r\x1b[K');
     process.stderr.write(
       `${this.label ? this.label + ' ' : ''}${bar} ${status} ${dim(elapsed)}`,
     );
   }
 
   private formatTime(ms: number): string {
     const s = Math.round(ms / 1000);
     if (s < 60) return `${s}s`;
     const m = Math.floor(s / 60);
     const sec = s % 60;
     return `${m}m ${sec}s`;
   }
 }
 
 /**
  * Run an async callback for each item in an array, showing a progress bar.
  */
 export async function progress<T, R>(
   items: T[],
   fn: (item: T, index: number) => Promise<R>,
   options: { label?: string } = {},
 ): Promise<R[]> {
   const bar = new Progress({ total: items.length, label: options.label });
   const results: R[] = [];
   for (let i = 0; i < items.length; i++) {
     results.push(await fn(items[i]!, i));
     bar.tick();
   }
   bar.complete();
   return results;
 }
