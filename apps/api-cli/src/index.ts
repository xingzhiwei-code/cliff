import { createCli } from '@cliff/core';
import type { CommandDef } from '@cliff/core';
import requestCommand from './commands/request';
import collectionList from './commands/collection/list';
import collectionRun from './commands/collection/run';
import collectionDelete from './commands/collection/delete';

const cli = createCli({
  name: 'api',
  version: '0.0.1',
  description: 'API debugging tool — curl for the TypeScript era',
});

// Register commands with full names (subcommands use parent prefix)
cli.register(requestCommand.def as CommandDef);
cli.register({ ...collectionList.def, name: 'collection list' } as CommandDef);
cli.register({ ...collectionRun.def, name: 'collection run' } as CommandDef);
cli.register({ ...collectionDelete.def, name: 'collection delete' } as CommandDef);

await cli.run();
