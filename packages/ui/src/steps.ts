 import { cyan, gray, green, dim } from './color';
 
 /** A single step in a multi-step workflow. */
 export interface Step {
   title: string;
   run: () => Promise<void>;
 }
 
 /**
  * Run a sequence of steps, showing a visual indicator for each.
  * Failed steps stop the sequence.
  */
 export async function steps(steps: Step[]): Promise<void> {
   for (let i = 0; i < steps.length; i++) {
     const step = steps[i]!;
     const num = i + 1;
     const total = steps.length;
     process.stderr.write(`${cyan(`[${num}/${total}]`)} ${step.title}...`);
 
     try {
       await step.run();
       process.stderr.write('\r\x1b[K');
       process.stderr.write(`${green('✔')} ${step.title} ${dim('done')}\n`);
     } catch (err) {
       process.stderr.write('\r\x1b[K');
       process.stderr.write(`${cyan('✖')} ${step.title} ${gray('failed')}\n`);
       throw err;
     }
   }
 }
