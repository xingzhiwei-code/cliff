 import { existsSync, readFileSync } from 'node:fs';
 import { join } from 'node:path';
 import { homedir } from 'node:os';
 import type { OptionsDef, ResolvedOptions } from './types';
 
 /** Supported config file names to search for. */
 const CONFIG_NAMES = [
   (name: string) => `.${name}.json`,
   (name: string) => `.${name}rc`,
   (name: string) => `.${name}.yml`,
   (name: string) => `.${name}.yaml`,
   (name: string) => `.${name}.toml`,
   (name: string) => `${name}.config.json`,
   (name: string) => `${name}.config.js`,
 ];
 
 /** Search directories for config files (project root first, then user home). */
 const SEARCH_DIRS = ['.', '..', '../..', homedir()];
 
 /** Loaded config with its source for debugging. */
 export interface ConfigResult {
   values: Record<string, unknown>;
   source: string | null;
 }
 
 /**
  * Load configuration from files, with priority.
  * Searches for config files in the project directory and user home.
  * Supports JSON and rc (JSON) formats natively; YAML/TOML need optional deps.
  */
 export function loadConfig(cliName: string): ConfigResult {
   for (const dir of SEARCH_DIRS) {
     for (const nameFn of CONFIG_NAMES) {
       const filename = nameFn(cliName);
       const filepath = join(dir, filename);
       if (existsSync(filepath)) {
         try {
           const content = readFileSync(filepath, 'utf-8');
           const parsed = parseConfigFile(filepath, content);
           if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
             return { values: parsed as Record<string, unknown>, source: filepath };
           }
         } catch {
           // Silently skip unparseable configs
         }
       }
     }
   }
   return { values: {}, source: null };
 }
 
 /** Parse a config file based on its extension. */
 function parseConfigFile(filepath: string, content: string): unknown {
   if (filepath.endsWith('.json') || filepath.endsWith('rc') || filepath.endsWith('.js')) {
     // rc files are JSON format
     if (filepath.endsWith('.js')) {
       // For .config.js files, expect a module that exports default
       // We don't eval JS for security; skip
       return null;
     }
     return JSON.parse(content);
   }
   if (filepath.endsWith('.yml') || filepath.endsWith('.yaml')) {
     return parseYaml(content);
   }
   if (filepath.endsWith('.toml')) {
     return parseToml(content);
   }
   return null;
 }
 
 /** Minimal YAML parser for flat key-value configs (no nesting, no arrays, no complex types). */
 function parseYaml(content: string): Record<string, unknown> | null {
   const result: Record<string, unknown> = {};
   const lines = content.split('\n');
   let hasContent = false;
 
   for (const line of lines) {
     const trimmed = line.trim();
     // Skip comments and empty lines
     if (!trimmed || trimmed.startsWith('#')) continue;
 
     const colonIdx = trimmed.indexOf(':');
     if (colonIdx === -1) continue;
 
     const key = trimmed.slice(0, colonIdx).trim();
     const rawValue = trimmed.slice(colonIdx + 1).trim();
     let value: unknown = rawValue;
 
     // Parse common types
     if (rawValue === 'true') value = true;
     else if (rawValue === 'false') value = false;
     else if (rawValue === 'null' || rawValue === '~') value = null;
     else if (/^-?\d+(\.\d+)?$/.test(rawValue)) value = Number(rawValue);
     else if (rawValue.startsWith('"') && rawValue.endsWith('"')) value = rawValue.slice(1, -1);
     else if (rawValue.startsWith("'") && rawValue.endsWith("'")) value = rawValue.slice(1, -1);
 
     result[key] = value;
     hasContent = true;
   }
 
   return hasContent ? result : null;
 }
 
 /** Minimal TOML parser for flat key-value configs. */
 function parseToml(content: string): Record<string, unknown> | null {
   const result: Record<string, unknown> = {};
   const lines = content.split('\n');
   let hasContent = false;
 
   for (const line of lines) {
     const trimmed = line.trim();
     // Skip comments, empty lines, and section headers
     if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('[')) continue;
 
     const eqIdx = trimmed.indexOf('=');
     if (eqIdx === -1) continue;
 
     const key = trimmed.slice(0, eqIdx).trim();
     const rawValue = trimmed.slice(eqIdx + 1).trim();
     let value: unknown = rawValue;
 
     if (rawValue === 'true') value = true;
     else if (rawValue === 'false') value = false;
     else if (/^-?\d+(\.\d+)?$/.test(rawValue)) value = Number(rawValue);
     else if (rawValue.startsWith('"') && rawValue.endsWith('"')) value = rawValue.slice(1, -1);
     else if (rawValue.startsWith("'") && rawValue.endsWith("'")) value = rawValue.slice(1, -1);
 
     result[key] = value;
     hasContent = true;
   }
 
   return hasContent ? result : null;
 }
 
 /**
  * Map environment variables to option keys.
  * Converts CLI_NAME to env var prefix: "my-tool" → "MY_TOOL".
  * Then maps MY_TOOL_ENV → env, MY_TOOL_FORCE → force.
  */
 export function envPrefix(cliName: string): string {
   return cliName.replace(/-/g, '_').toUpperCase();
 }
 
 /**
  * Load values from environment variables using the CLI's prefix.
  * e.g. for "my-tool", reads MY_TOOL_ENV → { env: "..." }
  */
 export function loadEnv(prefix: string): Record<string, unknown> {
   const result: Record<string, unknown> = {};
   const env = process.env;
 
   for (const [key, value] of Object.entries(env)) {
     if (key.startsWith(prefix + '_') && value !== undefined) {
       const optionKey = key
         .slice(prefix.length + 1)
         .toLowerCase()
         .replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
       result[optionKey] = value;
     }
   }
 
   return result;
 }
 
 /**
  * Resolve final option values with full priority chain:
  * 1. CLI arguments (already parsed)
  * 2. Environment variables
  * 3. Config file values
  * 4. Default values (already in parsed CLI args)
  *
  * Returns the merged options with correct types.
  */
 export function resolveOptions<TOptions extends OptionsDef>(
   cliArgs: ResolvedOptions<TOptions>,
   envValues: Record<string, unknown>,
   configValues: Record<string, unknown>,
   optionsDef: TOptions,
 ): ResolvedOptions<TOptions> {
   const result = { ...cliArgs } as Record<string, unknown>;
 
   for (const key of Object.keys(optionsDef)) {
     const def = optionsDef[key]!;
 
     // Only apply env/config if CLI didn't override the default
     const hasCliOverride = cliArgs[key] !== def.default;
 
     if (!hasCliOverride) {
       // Try env var
       if (key in envValues) {
         result[key] = coerceValue(envValues[key], def);
         continue;
       }
       // Try config file
       if (key in configValues) {
         result[key] = coerceValue(configValues[key], def);
       }
     }
   }
 
   return result as ResolvedOptions<TOptions>;
 }
 
 function coerceValue(value: unknown, def: { type: string; choices?: string[]; default?: unknown }): unknown {
   if (def.type === 'string') return String(value);
   if (def.type === 'boolean') {
     if (typeof value === 'boolean') return value;
     const s = String(value).toLowerCase();
     return s === 'true' || s === '1' || s === 'yes';
   }
   if (def.type === 'number') {
     const n = Number(value);
     return isNaN(n) ? def.default : n;
   }
   if (def.type === 'enum') {
     const s = String(value);
     if (def.choices?.includes(s)) return s;
     return def.default;
   }
   return value;
 }
