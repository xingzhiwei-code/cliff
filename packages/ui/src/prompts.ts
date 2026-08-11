 import * as readline from 'node:readline';
 import { cyan, gray, dim, green } from './color';
 
 
 let rl: readline.Interface | null = null;
 
 function getReadline(): readline.Interface {
   if (!rl) {
     rl = readline.createInterface({
       input: process.stdin,
       output: process.stderr,
     });
   }
   return rl;
 }
 
 function closeReadline(): void {
   if (rl) {
     rl.close();
     rl = null;
   }
 }
 
 function ask(query: string): Promise<string> {
   return new Promise((resolve) => {
     getReadline().question(query, (answer) => {
       resolve(answer);
     });
   });
 }
 
 /**
  * Ask a yes/no confirmation question.
  * Returns true for 'y'/'yes', false otherwise.
  */
 export async function confirm(message: string, initial = true): Promise<boolean> {
   const hint = initial ? '(Y/n)' : '(y/N)';
   const answer = await ask(`${cyan('?')} ${message} ${gray(hint)} `);
   closeReadline();
   const trimmed = answer.trim().toLowerCase();
   if (trimmed === '') return initial;
   return trimmed === 'y' || trimmed === 'yes';
 }
 
 /** A single choice in a select menu. */
 export interface Choice<T = string> {
   label: string;
   value: T;
   hint?: string;
 }
 
 /**
  * Display a single-select list. Returns the chosen value.
  * Uses arrow keys for navigation, enter to confirm.
  */
 export async function select<T = string>(
   message: string,
   choices: Choice<T>[],
 ): Promise<T> {
   if (choices.length === 0) throw new Error('select requires at least one choice');
 
   return new Promise((resolve) => {
     const stdin = process.stdin;
     const rawMode = stdin.isTTY;
 
     if (rawMode) stdin.setRawMode(true);
     stdin.resume();
 
     let selectedIndex = 0;
 
     function render(promptLine: string) {
       // Clear previous render
       for (let i = 0; i < choices.length; i++) {
         process.stderr.write('\x1b[2K');
         if (i < choices.length - 1) process.stderr.write('\x1b[1A');
       }
       process.stderr.write('\r');
 
       process.stderr.write(`${cyan('?')} ${promptLine}\n`);
       for (let i = 0; i < choices.length; i++) {
         const choice = choices[i]!;
         const prefix = i === selectedIndex ? cyan('❯') : ' ';
         const label = i === selectedIndex ? choice.label : dim(choice.label);
         const hint = choice.hint ? ` ${gray(choice.hint)}` : '';
         process.stderr.write(`${prefix} ${label}${hint}\n`);
       }
     }
 
     render(message);
 
     function cleanup() {
       stdin.removeListener('data', onData);
       if (rawMode) stdin.setRawMode(false);
       stdin.pause();
       closeReadline();
     }
 
     function onData(key: Buffer) {
       const str = key.toString();
       // Up arrow or k
       if (str === '\x1b[A' || str === 'k') {
         selectedIndex = (selectedIndex - 1 + choices.length) % choices.length;
         render(message);
       }
       // Down arrow or j
       else if (str === '\x1b[B' || str === 'j') {
         selectedIndex = (selectedIndex + 1) % choices.length;
         render(message);
       }
       // Enter
       else if (str === '\r' || str === '\n') {
         cleanup();
         process.stderr.write(`${cyan('✔')} ${message} ${cyan(choices[selectedIndex]!.label)}\n`);
         resolve(choices[selectedIndex]!.value);
       }
       // Ctrl+C
       else if (str === '\x03') {
         cleanup();
         process.stderr.write('\n');
         process.exit(3);
       }
     }
 
     stdin.on('data', onData);
   });
 }
 
 /**
  * Prompt the user for text input.
  */
 export async function input(
   message: string,
   options: {
     default?: string;
     validate?: (value: string) => true | string;
   } = {},
 ): Promise<string> {
   const hint = options.default ? ` ${gray(`(${options.default})`)}` : '';
   const prompt = `${cyan('?')} ${message}${hint}: `;
 
   while (true) {
     const answer = await ask(prompt);
     const value = answer.trim() || options.default || '';
 
     if (options.validate) {
       const result = options.validate(value);
       if (result !== true) {
         process.stderr.write(`${gray('  ' + result)}\n`);
         continue;
       }
     }
 
     closeReadline();
     return value;
   }
 }
 
 /**
  * Prompt for a password (input is hidden).
  */
 export async function password(message: string): Promise<string> {
   return new Promise((resolve) => {
     const stdin = process.stdin;
     const rawMode = stdin.isTTY;
     if (rawMode) stdin.setRawMode(true);
     stdin.resume();
 
     process.stderr.write(`${cyan('?')} ${message}: `);
     let buf = '';
 
     function cleanup() {
       stdin.removeListener('data', onData);
       if (rawMode) stdin.setRawMode(false);
       stdin.pause();
       closeReadline();
     }
 
     function onData(key: Buffer) {
       const str = key.toString();
       // Enter
       if (str === '\r' || str === '\n') {
         process.stderr.write('\n');
         cleanup();
         resolve(buf);
         return;
       }
       // Backspace
       if (str === '\x7f' || str === '\b') {
         if (buf.length > 0) {
           buf = buf.slice(0, -1);
           process.stderr.write('\b \b');
         }
         return;
       }
       // Ctrl+C
       if (str === '\x03') {
         process.stderr.write('\n');
         cleanup();
         process.exit(3);
         return;
       }
       // Printable chars only
       if (str.length === 1 && str.charCodeAt(0) >= 32) {
         buf += str;
         process.stderr.write('*');
       }
     }
 
     stdin.on('data', onData);
   });
 }
 
 // Track cursor row for clearing

/**
 * Display a multi-select list. Returns the chosen values.
 * Use space to toggle, enter to confirm.
 */
export async function multiselect<T = string>(
  message: string,
  choices: Choice<T>[],
): Promise<T[]> {
  if (choices.length === 0) throw new Error('multiselect requires at least one choice');

  return new Promise((resolve) => {
    const stdin = process.stdin;
    const rawMode = stdin.isTTY;

    if (rawMode) stdin.setRawMode(true);
    stdin.resume();

    let selectedIndex = 0;
    const checked = new Set<number>();

    function render(promptLine: string) {
      // Clear previous render
      for (let i = 0; i < choices.length; i++) {
        process.stderr.write('\x1b[2K');
        if (i < choices.length - 1) process.stderr.write('\x1b[1A');
      }
      process.stderr.write('\r');

      process.stderr.write(`${cyan('?')} ${promptLine} ${gray(`(${checked.size} selected)`)}\n`);
      for (let i = 0; i < choices.length; i++) {
        const choice = choices[i]!;
        const isSelected = i === selectedIndex;
        const isChecked = checked.has(i);
        const pointer = isSelected ? cyan('❯') : ' ';
        const checkbox = isChecked ? green('◉') : dim('○');
        const label = isSelected ? choice.label : dim(choice.label);
        const hint = choice.hint ? ` ${gray(choice.hint)}` : '';
        process.stderr.write(`${pointer} ${checkbox} ${label}${hint}\n`);
      }
    }

    render(message);

    function cleanup() {
      stdin.removeListener('data', onData);
      if (rawMode) stdin.setRawMode(false);
      stdin.pause();
      closeReadline();
    }

    function onData(key: Buffer) {
      const str = key.toString();
      // Up arrow or k
      if (str === '\x1b[A' || str === 'k') {
        selectedIndex = (selectedIndex - 1 + choices.length) % choices.length;
        render(message);
      }
      // Down arrow or j
      else if (str === '\x1b[B' || str === 'j') {
        selectedIndex = (selectedIndex + 1) % choices.length;
        render(message);
      }
      // Space to toggle
      else if (str === ' ') {
        if (checked.has(selectedIndex)) {
          checked.delete(selectedIndex);
        } else {
          checked.add(selectedIndex);
        }
        render(message);
      }
      // Enter
      else if (str === '\r' || str === '\n') {
        cleanup();
        const selected = [...checked].sort().map((i) => choices[i]!.value);
        process.stderr.write(
          `${cyan('✔')} ${message} ${cyan(`${selected.length} selected`)}\n`,
        );
        resolve(selected);
      }
      // Ctrl+C
      else if (str === '\x03') {
        cleanup();
        process.stderr.write('\n');
        process.exit(3);
      }
    }

    stdin.on('data', onData);
  });
}
