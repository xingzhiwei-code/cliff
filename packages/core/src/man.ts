import type { Command } from './types';

/**
 * Generate a man page in troff format for the CLI.
 * Outputs to stdout so it can be piped: `my-tool man > my-tool.1`
 */
export function generateManPage(
  cliName: string,
  version: string | undefined,
  description: string | undefined,
  commands: Command[],
): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lines: string[] = [];

  // Header
  lines.push(`.TH ${cliName.toUpperCase()} "1" "${date}" "${cliName} ${version ?? ''}" "User Commands"`);
  lines.push('.SH NAME');
  lines.push(`${cliName} \\- ${description ?? 'A CLI tool built with cliff'}`);
  lines.push('');

  // Synopsis
  lines.push('.SH SYNOPSIS');
  lines.push(`.B ${cliName}`);
  lines.push(`.I command`);
  lines.push(`[\\fIoptions\\fR]`);
  lines.push('');

  // Description
  if (description) {
    lines.push('.SH DESCRIPTION');
    lines.push(description);
    lines.push('');
  }

  // Commands
  if (commands.length > 0) {
    lines.push('.SH COMMANDS');
  }
  for (const cmd of commands) {
    if (cmd.def.hidden) continue;
    const name = cmd.parentName
      ? `${cmd.parentName} ${cmd.def.name}`
      : cmd.def.name;
    lines.push(`.TP`);
    lines.push(`.B ${name}`);
    if (cmd.def.description) {
      lines.push(cmd.def.description);
    }
    lines.push('');

    // Options for this command
    if (cmd.def.options && Object.keys(cmd.def.options).length > 0) {
      for (const [key, opt] of Object.entries(cmd.def.options)) {
        if (opt.hidden) continue;
        const alias = opt.alias ? `\\-${opt.alias}, ` : '';
        const flag = `\\fB${alias}\\-\\-${key}\\fR`;
        const typeHint = opt.type !== 'boolean' ? ` \\fI${opt.type}\\fR` : '';
        const desc = opt.description ? `  ${opt.description}` : '';
        const defVal = opt.default !== undefined
          ? ` (default: ${JSON.stringify(opt.default)})`
          : '';
        lines.push(`.RS`);
        lines.push(`${flag}${typeHint}${desc}${defVal}`);
        lines.push(`.RE`);
      }
      lines.push('');
    }
  }

  // Global options
  lines.push('.SH "GLOBAL OPTIONS"');
  lines.push(`.TP`);
  lines.push(`.B \\-\\-help`);
  lines.push(`Show help for a command.`);
  lines.push(`.TP`);
  lines.push(`.B \\-\\-version`);
  lines.push(`Show version information.`);
  lines.push(`.TP`);
  lines.push(`.B \\-\\-debug`);
  lines.push(`Enable debug output.`);
  lines.push('');

  // See also
  lines.push('.SH "SEE ALSO"');
  lines.push(`.BR ${cliName} (1),`);
  lines.push(`.BR npm (1)`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Print a man page for the CLI to stdout.
 */
export function printManPage(
  cliName: string,
  version: string | undefined,
  description: string | undefined,
  commands: Command[],
): void {
  process.stdout.write(generateManPage(cliName, version, description, commands));
}
