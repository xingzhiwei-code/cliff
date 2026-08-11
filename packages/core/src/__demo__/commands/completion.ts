 import { defineCommand } from '../../command';
 import { generateCompletion, printCompletion } from '../../completion';
 
 export default defineCommand({
   name: 'completion',
   description: 'Generate shell completion script',
   options: {
     shell: {
       type: 'enum',
       choices: ['bash', 'zsh', 'fish'],
       default: 'zsh',
       description: 'Shell to generate completion for',
     },
   },
   async run({ options, cli }) {
     printCompletion('my-tool', cli.getCommands(), options.shell as 'bash' | 'zsh' | 'fish');
   },
 });
