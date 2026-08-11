/** The UI toolkit interface injected into every command's run context. */
export interface Ui {
  log: (message: string) => void;
  success: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  section: (title: string) => void;
  newline: () => void;
  stdout: (message: string) => void;
  table: <T extends Record<string, unknown>>(data: T[], columns: (keyof T)[], options?: import('./table').TableOptions) => void;
  confirm: (message: string, initial?: boolean) => Promise<boolean>;
  select: <T = string>(message: string, choices: import('./prompts').Choice<T>[]) => Promise<T>;
  multiselect: <T = string>(message: string, choices: import('./prompts').Choice<T>[]) => Promise<T[]>;
  input: (message: string, options?: { default?: string; validate?: (value: string) => true | string }) => Promise<string>;
  password: (message: string) => Promise<string>;
  spinner: <T>(text: string, fn: () => Promise<T>) => Promise<T>;
}
