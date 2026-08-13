import type { Plugin } from '@cliffx/core';
import { execSync } from 'node:child_process';

function docker(args: string): string {
  try {
    return execSync(`docker ${args}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Docker command failed: ${message}`);
  }
}

function checkDockerDaemon(): boolean {
  try {
    docker('info');
    return true;
  } catch {
    return false;
  }
}

async function runDocker(args: string): Promise<string> {
  return docker(args);
}

export const pluginDocker: Plugin = {
  name: '@cliffx/plugin-docker',

  hooks: {
    'before:run': async () => {
      if (!checkDockerDaemon()) {
        throw new Error('Docker daemon is not running. Please start Docker and try again.');
      }
    },
    'on:error': async (err) => {
      if (err.message && err.message.includes('daemon')) {
        process.stderr.write('Tip: Make sure Docker Desktop or dockerd is running.\n');
      }
    },
  },

  commands: {
    'docker:build': {
      name: 'docker:build',
      description: 'Build a Docker image',
      options: {
        tag: {
          type: 'string',
          description: 'Image tag (e.g. my-app:latest)',
        },
        file: {
          type: 'string',
          default: 'Dockerfile',
          description: 'Path to Dockerfile',
        },
        context: {
          type: 'string',
          default: '.',
          description: 'Build context directory',
        },
      },
      async run({ options, ui }: { options: any, ui: any }) {
        const tag = options.tag;
        if (!tag) {
          ui.error('--tag is required');
          process.exit(2);
        }

        const result = await ui.spinner(
          `Building image ${tag}...`,
          () => runDocker(`build -t ${tag} -f ${String(options.file)} ${String(options.context)}`),
        );

        ui.success(`Image built: ${tag}`);
        ui.stdout(result);
      },
    },

    'docker:push': {
      name: 'docker:push',
      description: 'Push an image to a registry',
      options: {
        tag: {
          type: 'string',
          description: 'Image tag to push',
        },
      },
      async run({ options, ui }: { options: any, ui: any }) {
        const tag = options.tag;
        if (!tag) {
          ui.error('--tag is required');
          process.exit(2);
        }

        await ui.spinner(`Pushing ${tag}...`, () => runDocker(`push ${tag}`));
        ui.success(`Pushed: ${tag}`);
      },
    },

    'docker:run': {
      name: 'docker:run',
      description: 'Run a container from an image',
      options: {
        image: {
          type: 'string',
          description: 'Image to run',
        },
        name: {
          type: 'string',
          description: 'Container name',
        },
        port: {
          type: 'string',
          description: 'Port mapping (e.g. 3000:3000)',
        },
        env: {
          type: 'string',
          description: 'Environment variables (e.g. NODE_ENV=production)',
        },
        detach: {
          type: 'boolean',
          default: true,
          description: 'Run in detached mode',
        },
      },
      async run({ options, ui }: { options: any, ui: any }) {
        const image = options.image;
        if (!image) {
          ui.error('--image is required');
          process.exit(2);
        }

        const parts: string[] = ['run'];
        if (options.name) parts.push(`--name ${String(options.name)}`);
        if (options.port) parts.push(`-p ${String(options.port)}`);
        if (options.env) parts.push(`-e ${String(options.env)}`);
        if (options.detach) parts.push('-d');
        parts.push(String(image));

        const output = await ui.spinner(
          `Starting container ${String(options.name || image)}...`,
          () => runDocker(parts.join(' ')),
        );

        ui.success(`Container started: ${output.slice(0, 12)}`);
        ui.stdout(output);
      },
    },

    'docker:cleanup': {
      name: 'docker:cleanup',
      description: 'Remove stopped containers and dangling images',
      options: {
        all: {
          type: 'boolean',
          default: false,
          description: 'Also remove all unused images',
        },
      },
      async run({ options, ui }: { options: any, ui: any }) {
        const containers = await ui.spinner(
          'Removing stopped containers...',
          () => runDocker('container prune -f'),
        );
        if (containers) ui.log(containers);
        else ui.log('No stopped containers.');

        if (options.all) {
          const images = await ui.spinner(
            'Removing unused images...',
            () => runDocker('image prune -a -f'),
          );
          if (images) ui.log(images);
          else ui.log('No unused images.');
        } else {
          const images = await ui.spinner(
            'Removing dangling images...',
            () => runDocker('image prune -f'),
          );
          if (images) ui.log(images);
          else ui.log('No dangling images.');
        }

        ui.success('Cleanup complete.');
      },
    },

    'docker:deploy': {
      name: 'docker:deploy',
      description: 'Build, push, and run a container',
      options: {
        tag: {
          type: 'string',
          description: 'Image tag',
        },
        name: {
          type: 'string',
          description: 'Container name',
        },
        port: {
          type: 'string',
          description: 'Port mapping (e.g. 3000:3000)',
        },
        file: {
          type: 'string',
          default: 'Dockerfile',
          description: 'Path to Dockerfile',
        },
        context: {
          type: 'string',
          default: '.',
          description: 'Build context directory',
        },
      },
      async run({ options, ui }: { options: any, ui: any }) {
        const tag = options.tag;
        if (!tag) {
          ui.error('--tag is required');
          process.exit(2);
        }

        ui.section('Build');
        docker(`build -t ${tag} -f ${String(options.file)} ${String(options.context)}`);
        ui.success(`Built: ${tag}`);

        ui.section('Push');
        docker(`push ${tag}`);
        ui.success(`Pushed: ${tag}`);

        ui.section('Run');
        const runParts: string[] = ['run'];
        if (options.name) runParts.push(`--name ${String(options.name)}`);
        if (options.port) runParts.push(`-p ${String(options.port)}`);
        runParts.push('-d', String(tag));
        const containerId = docker(runParts.join(' '));
        ui.success(`Container started: ${containerId.slice(0, 12)}`);
        ui.stdout(containerId);
      },
    },
  },
};

export default pluginDocker;
