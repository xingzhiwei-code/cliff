import { c, dim } from '@cliffx/ui';

interface UpdateInfo {
  current: string;
  latest: string;
  outdated: boolean;
}

/** Cache check timestamp to avoid repeated checks in short runs. */
let lastCheck = 0;
const CHECK_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours
const NPM_REGISTRY = 'https://registry.npmjs.org';

/**
 * Check for updates non-blocking.
 * Only checks once every 24 hours.
 * Shows a notice if a newer version is available.
 */
export async function checkForUpdates(
  packageName: string,
  currentVersion: string,
  options: { silent?: boolean } = {},
): Promise<UpdateInfo | null> {
  if (Date.now() - lastCheck < CHECK_INTERVAL) return null;
  lastCheck = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `${NPM_REGISTRY}/${packageName}/latest`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json() as { version: string };
    const latest = data.version;

    const outdated = isNewer(latest, currentVersion);
    if (outdated && !options.silent) {
      showUpdateNotice(packageName, currentVersion, latest);
    }

    return { current: currentVersion, latest, outdated };
  } catch {
    // Silent fail — network issues should not break the CLI
    return null;
  }
}

function showUpdateNotice(pkg: string, current: string, latest: string): void {
  process.stderr.write('\n');
  process.stderr.write(
    `${c(' Update available!').yellow().bold()}\n`,
  );
  process.stderr.write(
    `   ${dim(`${current} → ${c(latest).green()}`)}\n`,
  );
  process.stderr.write(
    `   ${dim(`Run `)}${c(`pnpm add ${pkg}@latest`).cyan()}${dim(' to upgrade.')}\n`,
  );
  process.stderr.write('\n');
}

/**
 * Compare two semver strings and return true if latest > current.
 */
function isNewer(latest: string, current: string): boolean {
  const parse = (v: string): number[] => v.replace(/^[v~^]/, '').split('.').map(Number);
  const [lMaj = 0, lMin = 0, lPatch = 0] = parse(latest);
  const [cMaj = 0, cMin = 0, cPatch = 0] = parse(current);

  if (lMaj !== cMaj) return lMaj > cMaj;
  if (lMin !== cMin) return lMin > cMin;
  return lPatch > cPatch;
}
