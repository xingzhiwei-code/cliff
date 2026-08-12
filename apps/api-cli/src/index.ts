import { createCli } from '@cliff/core';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const cli = createCli({
  name: 'api',
  version: '0.0.1',
  description: 'API debugging tool — curl for the TypeScript era',
});

await cli.discoverAllPlugins(__dirname);
await cli.discover(__dirname);
await cli.run();
