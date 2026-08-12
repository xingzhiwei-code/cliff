import { defineCommand } from '@cliff/core';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.api-cli');
const COLLECTION_FILE = join(CONFIG_DIR, 'collections.json');

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

interface SavedRequest {
  name: string;
  method: string;
  url: string;
  headers: string;
  body: string;
}

function loadCollections(): Record<string, SavedRequest> {
  ensureConfigDir();
  if (!existsSync(COLLECTION_FILE)) return {};
  return JSON.parse(readFileSync(COLLECTION_FILE, 'utf-8'));
}

function saveCollections(data: Record<string, SavedRequest>): void {
  ensureConfigDir();
  writeFileSync(COLLECTION_FILE, JSON.stringify(data, null, 2));
}

async function sendRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string | undefined,
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
  name: 'request',
  description: 'Send an HTTP request',
  options: {
    method: {
      type: 'enum',
      choices: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
      default: 'GET',
      description: 'HTTP method',
      alias: 'X',
    },
    url: {
      type: 'string',
      description: 'Request URL',
    },
    headers: {
      type: 'string',
      description: 'Headers (key:value,key:value)',
      alias: 'H',
    },
    body: {
      type: 'string',
      description: 'Request body (JSON string)',
      alias: 'd',
    },
    save: {
      type: 'string',
      description: 'Save this request to a collection',
    },
  },
  examples: [
    'api request --url https://api.github.com',
    'api request --method POST --url https://api.example.com/data --body \'{"key":"value"}\'',
    'api request --url https://api.example.com --headers "Authorization: Bearer token" --save my-request',
  ],
  async run({ options, ui }) {
    const url = options.url;
    if (!url) {
      ui.error('--url is required');
      process.exit(2);
    }

    const method = options.method as string;
    const headers = parseHeaders(String(options.headers));
    const body = options.body ? String(options.body) : undefined;

    // Save request if requested
    if (options.save) {
      const name = String(options.save);
      const collections = loadCollections();
      collections[name] = {
        name,
        method,
        url,
        headers: String(options.headers),
        body: String(options.body),
      };
      saveCollections(collections);
      ui.log(`Saved request "${name}" to collection.`);
    }

    // Send the request
    const result = await ui.spinner(
      `${method} ${url}`,
      () => sendRequest(method, url, headers, body),
    );

    // Status line
    const statusColor = result.status < 300 ? '✓' : result.status < 500 ? '⚠' : '✖';
    ui.newline();
    ui.log(`${statusColor} ${result.status} ${result.statusText} — ${result.duration}ms`);

    // Response headers
    ui.newline();
    ui.section('Response Headers');
    const headerRows = Object.entries(result.headers).map(([k, v]) => ({ key: k, value: v }));
    ui.table(headerRows, ['key', 'value']);

    // Response body
    ui.newline();
    ui.section('Response Body');
    let bodyOutput = result.body;
    try {
      bodyOutput = JSON.stringify(JSON.parse(result.body), null, 2);
    } catch {}
    ui.stdout(bodyOutput);
  },
});
