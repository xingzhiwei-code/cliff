 import { visibleLength } from './color';
 import { stdout } from './output';
 
 export interface TableOptions {
   /** Column headers. If omitted, keys are used. */
   headers?: string[];
 }
 
 /**
  * Render an array of objects as an aligned text table.
  * Output goes to stdout for pipeability.
  */
 export function table<T extends Record<string, unknown>>(
   data: T[],
   columns: (keyof T)[],
   options: TableOptions = {},
 ): void {
   if (data.length === 0) return;
 
   const headers = options.headers ?? columns.map(String);
   const rows = data.map((row) =>
     columns.map((col) => String(row[col] ?? ''))
   );
 
   // Calculate column widths
   const colWidths = columns.map((_, i) => {
     const headerLen = visibleLength(headers[i]!);
     const maxDataLen = Math.max(...rows.map((r) => visibleLength(r[i]!)));
     return Math.max(headerLen, maxDataLen);
   });
 
   const totalWidth = colWidths.reduce((s, w) => s + w + 3, 1);
 
   // Top border
   stdout('┌' + '─'.repeat(totalWidth - 2) + '┐');
 
   // Header
   const headerCells = headers.map((h, i) => padRight(h, colWidths[i]!));
   stdout('│ ' + headerCells.join(' │ ') + ' │');
 
   // Separator
   stdout('├' + colWidths.map((w) => '─'.repeat(w + 2)).join('┼') + '┤');
 
   // Data rows
   for (const row of rows) {
     const cells = row.map((cell, i) => padRight(cell, colWidths[i]!));
     stdout('│ ' + cells.join(' │ ') + ' │');
   }
 
   // Bottom border
   stdout('└' + '─'.repeat(totalWidth - 2) + '┘');
 }
 
 function padRight(text: string, width: number): string {
   const len = visibleLength(text);
   if (len >= width) return text;
   const padding = width - len;
   return text + ' '.repeat(padding);
 }
