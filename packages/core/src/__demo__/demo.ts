import { createCli } from '../cli';

async function main() {
  const cli = createCli({
    name: 'my-tool',
    version: '1.0.0',
    description: 'A demo CLI built with cliff',
    commandsDir: 'commands',
  });

  const deploy = await import('./commands/deploy');
  const config = await import('./commands/config');
  const completion = await import('./commands/completion');
  cli.register(deploy.default.def);
  cli.register(config.default.def);
  cli.register(completion.default.def);

  await cli.run();
}

main().catch(console.error);
