import { error as _error, warn, log, dim } from '@cliffx/ui';

/** Format and display a user-friendly error. */
export function prettyError(err: Error, debug = false): void {
  const message = err.message || 'An unknown error occurred';
  _error(message);

  // Show a hint if we recognize the error pattern
  const hint = getErrorHint(err);
  if (hint) {
    log(`  ${dim('Tip:')} ${hint}`);
  }

  if (debug && err.stack) {
    // Filter stack to show only user code
    const lines = err.stack.split('\n');
    const relevant = lines.filter(
      (line) => !line.includes('node_modules') && !line.includes('node:internal'),
    );
    if (relevant.length > 1) {
      log('');
      log(dim('Stack trace:'));
      for (const line of relevant.slice(1, 5)) {
        log(dim(`  ${line.trim()}`));
      }
    }
  }
}

/** Common error patterns and their user-friendly hints. */
export function getErrorHint(err: Error): string | null {
  const msg = err.message.toLowerCase();
  const code = (err as NodeJS.ErrnoException).code?.toLowerCase();

  // Network errors
  if (msg.includes('econnrefused') || msg.includes('connect') || msg.includes('econnreset')) {
    return 'Check your network connection and try again.';
  }
  if (msg.includes('enotfound') || msg.includes('dns')) {
    return 'Could not resolve the hostname. Check your DNS or network settings.';
  }
  if (msg.includes('etimedout') || msg.includes('timeout')) {
    return 'The request timed out. Check your network or try increasing the timeout.';
  }

  // Permission errors
  if (code === 'eacces' || msg.includes('permission denied')) {
    return 'You may need to run this command with elevated permissions.';
  }
  if (code === 'eperm') {
    return 'Operation not permitted. Check file ownership or permissions.';
  }

  // File errors
  if (code === 'enoent' || msg.includes('not found') || msg.includes('no such file')) {
    return 'Check that the file or directory exists.';
  }
  if (code === 'eexist' || msg.includes('already exists')) {
    return 'The file or directory already exists. Use --force to overwrite.';
  }
  if (code === 'eisdir') {
    return 'Expected a file but found a directory.';
  }

  // Validation errors
  if (msg.includes('invalid') || msg.includes('expected')) {
    return null; // Validation errors are self-explanatory
  }

  // Generic fallback
  return null;
}

/**
 * Wrap an error handler to display a warning instead of a full error.
 * Useful for non-critical operations that shouldn't crash the CLI.
 */
export function recoverable(msg: string, fn: () => void): void {
  try {
    fn();
  } catch (err) {
    warn(`${msg}: ${err instanceof Error ? err.message : String(err)}`);
  }
}
