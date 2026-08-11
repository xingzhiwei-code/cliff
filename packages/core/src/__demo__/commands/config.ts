 import { defineCommand } from '../../command';
 
 export default defineCommand({
   name: 'config',
   description: 'Manage configuration',
   options: {
     show: {
       type: 'boolean',
       default: false,
       description: 'Show current config',
     },
   },
   async run({ options, ui }) {
     if (options.show) {
       ui.table(
         [
           { key: 'env', value: 'staging' },
           { key: 'region', value: 'us-east-1' },
         ],
         ['key', 'value'],
         { headers: ['Setting', 'Value'] },
       );
     } else {
       ui.info('Config management. Use --show to see current config.');
     }
   },
 });
