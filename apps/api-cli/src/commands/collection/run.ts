import { defineCommand } from '@cliff/core';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.api-cli');
const COLLECTION_FILE = join(CONFIG_DIR, 'collections.json');

interface SavedRequest {
  name: string;
  method: string;
  url: string;
  headers: string;
  body: string;
}

async function sendRequest(
  method: string, url: string, headers: Record<string, string>, body: string | undefined,
): Promise<{ status: number; statusText: string; headers: Record<string, string>; body: string; duration: number }> {
  const start = Date.now();
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body || undefined,
  });
  const duration = Date.now() - start;
  const text = await res.text();
  const resHeaders: Record<string, string> = {};
  res.headers.forEach((v, k) => { resHeaders[k] = v; });
  return { status: res.status, statusText: res.statusText, headers: resHeaders, body: text, duration };
}

function parseHeaders(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!raw) return result;
  for (const line of raw.split(',')) {
    const [k, ...v] = line.split(':');
    if (k && v.length) result[k.trim()] = v.join(':').trim();
  }
  return result;
}

export default defineCommand({
  name: 'run',
  description: 'Run a saved request from the collection',
  options: {
    name: { type: 'string', description: 'Name of the saved request' },
  },
  async run({ options, ui }) {
    const name = String(options.name);
    if (!name) { ui.error('--name is required'); process.exit(2); }

    if (!existsSync(COLLECTION_FILE)) {
      ui.error('No saved requests found.'); process.exit(1);
    }

    const collections: Record<string, SavedRequest> = JSON.parse(readFileSync(COLLECTION_FILE, 'utf-8'));
    const saved = collections[name];
    if (!saved) { ui.error(`Request "${name}" not found.`); process.exit(1); }

    const headers = parseHeaders(saved.headers);
    const body = saved.body || undefined;

    const result = await ui.spinner(`${saved.method} ${saved.url}`, () => sendRequest(saved.method, saved.url, headers, body));

    const statusColor = result.status < 300 ? '\u2713' : result.status < 500 ? '\u26A0' : '\u2716';
    ui.newline();
    ui.log(`${statusColor} ${result.status} ${result.statusText} \u2014 ${result.duration}ms`);

    ui.newline();
    ui.section('Response Body');
    let bodyOutput = result.body;
    try { bodyOutput = JSON.stringify(JSON.parse(result.body), null, 2); } catch {}
    ui.stdout(bodyOutput);
  },
});
