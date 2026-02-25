#!/usr/bin/env node
// Usage: node scripts/remove-server.mjs <server-name>
// Example: node scripts/remove-server.mjs com.figma.mcp/mcp

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_SCRIPT = join(__dirname, 'build-registry.mjs');

const name = process.argv[2];
if (!name) {
  console.error('Usage: node scripts/remove-server.mjs <server-name>');
  console.error('Example: node scripts/remove-server.mjs com.figma.mcp/mcp');
  process.exit(1);
}

const src = readFileSync(BUILD_SCRIPT, 'utf8');
const match = src.match(/const ALLOWED_SERVERS = \[([\s\S]*?)\];/);
if (!match) {
  console.error('✗ Could not find ALLOWED_SERVERS in build-registry.mjs');
  process.exit(1);
}

const entries = match[1]
  .split('\n')
  .map(l => l.trim())
  .filter(l => l.startsWith("'") || l.startsWith('"'))
  .map(l => l.replace(/[',]/g, '').trim());

if (!entries.includes(name)) {
  console.error(`✗ "${name}" is not in ALLOWED_SERVERS.`);
  console.log(`\nCurrently allowed servers:\n${entries.map(e => `  - ${e}`).join('\n')}`);
  process.exit(1);
}

const updated_entries = entries.filter(e => e !== name);
const newList = updated_entries.map(e => `  '${e}',`).join('\n');
const updated = src.replace(
  /const ALLOWED_SERVERS = \[[\s\S]*?\];/,
  `const ALLOWED_SERVERS = [\n${newList}\n];`
);
writeFileSync(BUILD_SCRIPT, updated);
console.log(`✓ Removed "${name}" from ALLOWED_SERVERS`);

// Rebuild
console.log('\nRebuilding registry...');
execSync('node scripts/build-registry.mjs', { stdio: 'inherit', cwd: join(__dirname, '..') });

console.log('\nDone! Commit and push to deploy.');
