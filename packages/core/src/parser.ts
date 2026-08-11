 import type { OptionDef, OptionsDef, ResolvedOptions } from './types';
 
 /** Parse raw argv into structured args and options using the command's option definitions. */
 export function parseArgs<TOptions extends OptionsDef>(
   rawArgs: string[],
   optionsDef: TOptions,
 ): ResolvedOptions<TOptions> {
   const result: Record<string, unknown> = {};
   const aliasMap = buildAliasMap(optionsDef);
 
   // Initialize defaults
   for (const [key, def] of Object.entries(optionsDef)) {
     result[key] = def.default;
   }
 
   let i = 0;
   while (i < rawArgs.length) {
     const arg = rawArgs[i]!;
 
     if (arg.startsWith('--')) {
       const eqIndex = arg.indexOf('=');
       let name: string;
       let value: string | undefined;
 
       if (eqIndex !== -1) {
         name = arg.slice(2, eqIndex);
         value = arg.slice(eqIndex + 1);
       } else {
         name = arg.slice(2);
       }
 
       // Handle --no- prefix for booleans
       if (name.startsWith('no-')) {
         const realName = name.slice(3);
         const resolved = resolveName(realName, optionsDef, aliasMap);
         if (resolved && optionsDef[resolved]?.type === 'boolean') {
           result[resolved] = false;
           i++;
           continue;
         }
       }
 
       const resolved = resolveName(name, optionsDef, aliasMap);
       if (resolved) {
         const def = optionsDef[resolved]!;
         if (def.type === 'boolean') {
           result[resolved] = value === undefined ? true : parseValue(value, def);
         } else {
           if (value === undefined) {
             i++;
             if (i < rawArgs.length) {
               value = rawArgs[i]!;
             }
           }
           if (value !== undefined) {
             result[resolved] = parseValue(value, def);
           }
         }
       }
     } else if (arg.startsWith('-') && arg.length === 2) {
       // Short alias
       const alias = arg.slice(1);
       const resolved = aliasMap[alias];
       if (resolved) {
         const def = optionsDef[resolved]!;
         if (def.type === 'boolean') {
           result[resolved] = true;
         } else {
           i++;
           if (i < rawArgs.length) {
             result[resolved] = parseValue(rawArgs[i]!, def);
           }
         }
       }
     }
 
     i++;
   }
 
   return result as ResolvedOptions<TOptions>;
 }
 
 /** Parse remaining positional args after option parsing. */
 export function parsePositional(rawArgs: string[]): string[] {
   const positional: string[] = [];
   let i = 0;
   while (i < rawArgs.length) {
     const arg = rawArgs[i]!;
     if (arg.startsWith('--')) {
       const eqIndex = arg.indexOf('=');
       if (eqIndex === -1) {
         // Check if next arg is a value
         i++;
         if (i < rawArgs.length && !rawArgs[i]!.startsWith('-')) {
           // skip value
         } else {
           continue;
         }
       }
     } else if (arg.startsWith('-') && arg.length === 2) {
       i++;
       if (i < rawArgs.length && !rawArgs[i]!.startsWith('-')) {
         // skip value
       } else {
         continue;
       }
     } else {
       positional.push(arg);
     }
     i++;
   }
   return positional;
 }
 
 function buildAliasMap(optionsDef: OptionsDef): Record<string, string> {
   const map: Record<string, string> = {};
   for (const [key, def] of Object.entries(optionsDef)) {
     if (def.alias) {
       map[def.alias] = key;
     }
   }
   return map;
 }
 
 function resolveName(
   name: string,
   optionsDef: OptionsDef,
   aliasMap: Record<string, string>,
 ): string | null {
   // Direct match
   if (optionsDef[name]) return name;
   // Alias match
   if (aliasMap[name]) return aliasMap[name]!;
   // Kebab-case to camelCase
   const camel = name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
   if (optionsDef[camel]) return camel;
   return null;
 }
 
 function parseValue(value: string, def: OptionDef): unknown {
   switch (def.type) {
     case 'string':
       return value;
     case 'boolean':
       return value === 'true' || value === '1';
     case 'number': {
       const n = Number(value);
       if (isNaN(n)) throw new Error(`Expected a number, got "${value}"`);
       return n;
     }
     case 'enum': {
       if (def.choices && !def.choices.includes(value)) {
         throw new Error(
           `Expected one of [${def.choices.join(', ')}], got "${value}"`,
         );
       }
       return value;
     }
     default:
       return value;
   }
 }
