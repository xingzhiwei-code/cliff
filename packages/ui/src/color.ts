 /** ANSI escape codes for terminal styling. Zero-dependency. */
 
 const ESC = '\x1b[';
 const CSI = (n: string) => `${ESC}${n}m`;
 const RESET = CSI('0');
 
 // Basic colors
 const colors = {
   black: 30,
   red: 31,
   green: 32,
   yellow: 33,
   blue: 34,
   magenta: 35,
   cyan: 36,
   white: 37,
   gray: 90,
   brightRed: 91,
   brightGreen: 92,
   brightYellow: 93,
   brightBlue: 94,
   brightMagenta: 95,
   brightCyan: 96,
   brightWhite: 97,
 } as const;
 
 const bgColors = {
   black: 40,
   red: 41,
   green: 42,
   yellow: 43,
   blue: 44,
   magenta: 45,
   cyan: 46,
   white: 47,
 } as const;
 
 const styles = {
   bold: 1,
   dim: 2,
   italic: 3,
   underline: 4,
 } as const;
 
 type ColorName = keyof typeof colors;
 type BgColorName = keyof typeof bgColors;
 type StyleName = keyof typeof styles;
 
 type StyleFn = (text: string) => string;
 
 function createColorFn(code: number): StyleFn {
   return (text: string) => `${CSI(String(code))}${text}${RESET}`;
 }
 
 /** Chainable color builder for composing multiple styles. */
 export function c(text: string) {
   return new ColorBuilder(text);
 }
 
 class ColorBuilder {
   private codes: number[] = [];
   constructor(private text: string) {}
 
   private color(name: ColorName) { this.codes.push(colors[name]); return this; }
   private bg(name: BgColorName) { this.codes.push(bgColors[name]); return this; }
   private style(name: StyleName) { this.codes.push(styles[name]); return this; }
 
   black() { return this.color('black'); }
   red() { return this.color('red'); }
   green() { return this.color('green'); }
   yellow() { return this.color('yellow'); }
   blue() { return this.color('blue'); }
   magenta() { return this.color('magenta'); }
   cyan() { return this.color('cyan'); }
   white() { return this.color('white'); }
   gray() { return this.color('gray'); }
   brightRed() { return this.color('brightRed'); }
   brightGreen() { return this.color('brightGreen'); }
   brightYellow() { return this.color('brightYellow'); }
   brightBlue() { return this.color('brightBlue'); }
   brightMagenta() { return this.color('brightMagenta'); }
   brightCyan() { return this.color('brightCyan'); }
   brightWhite() { return this.color('brightWhite'); }
 
   bgBlack() { return this.bg('black'); }
   bgRed() { return this.bg('red'); }
   bgGreen() { return this.bg('green'); }
   bgYellow() { return this.bg('yellow'); }
   bgBlue() { return this.bg('blue'); }
   bgMagenta() { return this.bg('magenta'); }
   bgCyan() { return this.bg('cyan'); }
   bgWhite() { return this.bg('white'); }
 
   bold() { return this.style('bold'); }
   dim() { return this.style('dim'); }
   italic() { return this.style('italic'); }
   underline() { return this.style('underline'); }
 
   toString(): string {
     if (this.codes.length === 0) return this.text;
     return `${CSI(this.codes.join(';'))}${this.text}${RESET}`;
   }
 }
 
 // Convenience direct-style functions
 export const red = createColorFn(colors.red);
 export const green = createColorFn(colors.green);
 export const yellow = createColorFn(colors.yellow);
 export const blue = createColorFn(colors.blue);
 export const magenta = createColorFn(colors.magenta);
 export const cyan = createColorFn(colors.cyan);
 export const gray = createColorFn(colors.gray);
 export const bold = createColorFn(styles.bold);
 export const dim = createColorFn(styles.dim);
 export const underline = createColorFn(styles.underline);
 
 /** Check if stdout supports colors. */
 export function supportsColor(): boolean {
   if (process.env.NO_COLOR) return false;
   if (process.env.FORCE_COLOR) return true;
   return process.stdout.isTTY && process.stdout.getColorDepth?.() > 1;
 }
 
 /** Strip ANSI escape codes from a string. */
 export function stripColor(text: string): string {
   return text.replace(/\x1b\[[0-9;]*m/g, '');
 }
 
 /** Get the visible length of a string (excluding ANSI codes). */
 export function visibleLength(text: string): number {
   return stripColor(text).length;
 }
