#!/usr/bin/env node
// Usage: node scripts/add-server.mjs <server-id>
// Example: node scripts/add-server.mjs com.figma.mcp/mcp
//
// Looks up the server in github.com/mcp, adds it to ALLOWED_SERVERS,
// and runs the build so the change is ready to push.

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_SCRIPT = join(__dirname, 'build-registry.mjs');

const name = process.argv[2];
if (!name) {
  console.error('Usage: node scripts/add-server.mjs <server-id>');
  console.error('Example: node scripts/add-server.mjs com.figma.mcp/mcp');
  process.exit(1);
}

// Verify the server exists in github.com/mcp
console.log(`Looking up "${name}" in github.com/mcp...`);
const res = await fetch(`https://github.com/mcp/${name}`, { headers: { Accept: 'application/json' } });
if (!res.ok) {
  console.error(`✗ Server not found: "${name}" (HTTP ${res.status})`);
  console.error(`  Browse available servers at https://github.com/mcp`);
  process.exit(1);
}
const json = await res.json();
const data = json.payload.mcpDetailsRoute.server_data;
if (!data) {
  console.error(`✗ Server not found: "${name}"`);
  console.error(`  Browse available servers at https://github.com/mcp`);
  process.exit(1);
}
console.log(`✓ Found: ${data.display_name} v${data.created_at}`);

// Add to ALLOWED_SERVERS in build-registry.mjs
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

if (entries.includes(name)) {
  console.log(`\n"${name}" is already in ALLOWED_SERVERS. Nothing to do.`);
  process.exit(0);
}

entries.push(name);
const newList = entries.map(e => `  '${e}',`).join('\n');
const updated = src.replace(
  /const ALLOWED_SERVERS = \[[\s\S]*?\];/,
  `const ALLOWED_SERVERS = [\n${newList}\n];`
);
writeFileSync(BUILD_SCRIPT, updated);
console.log(`\n✓ Added "${name}" to ALLOWED_SERVERS`);

// Rebuild
console.log('\nRebuilding registry...');
execSync('node scripts/build-registry.mjs', { stdio: 'inherit', cwd: join(__dirname, '..') });

console.log('\nDone! Commit and push to deploy.');
