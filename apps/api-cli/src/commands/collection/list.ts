import { defineCommand } from '@cliffx/core';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
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

export default defineCommand({
  name: 'list',
  description: 'List saved requests in the collection',
  async run({ ui }) {
    ensureConfigDir();
    if (!existsSync(COLLECTION_FILE)) {
      ui.log('No saved requests yet. Use --save with `api request` to save one.');
      return;
    }

    const collections: Record<string, SavedRequest> = JSON.parse(
      readFileSync(COLLECTION_FILE, 'utf-8'),
    );
    const entries = Object.values(collections);

    if (entries.length === 0) {
      ui.log('No saved requests.');
      return;
    }

    const rows = entries.map((e) => ({
      name: e.name,
      method: e.method,
      url: e.url,
    }));
    ui.table(rows, ['name', 'method', 'url']);
  },
});
