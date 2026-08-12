import { defineCommand } from '@cliff/core';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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

export default defineCommand({
  name: 'delete',
  description: 'Delete a saved request',
  options: {
    name: { type: 'string', description: 'Name of the request to delete' },
    all: { type: 'boolean', default: false, description: 'Delete all saved requests' },
  },
  async run({ options, ui }) {
    if (!existsSync(COLLECTION_FILE)) {
      ui.log('No saved requests to delete.');
      return;
    }

    if (options.all) {
      const confirmed = await ui.confirm('Delete all saved requests?');
      if (!confirmed) return;
      writeFileSync(COLLECTION_FILE, '{}');
      ui.success('All requests deleted.');
      return;
    }

    const name = String(options.name);
    if (!name) { ui.error('--name is required (or use --all to delete all)'); process.exit(2); }

    const collections: Record<string, SavedRequest> = JSON.parse(readFileSync(COLLECTION_FILE, 'utf-8'));
    if (!collections[name]) { ui.warn(`Request "${name}" not found.`); return; }

    delete collections[name];
    writeFileSync(COLLECTION_FILE, JSON.stringify(collections, null, 2));
    ui.success(`Deleted "${name}".`);
  },
});
