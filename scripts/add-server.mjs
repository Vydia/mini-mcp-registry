#!/usr/bin/env node
// Usage: node scripts/add-server.mjs <server-name>
// Example: node scripts/add-server.mjs io.github.someone/my-server
//
// Looks up the server in the MCP registry, adds it to ALLOWED_SERVERS,
// and runs the build so the change is ready to push.

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_SCRIPT = join(__dirname, 'build-registry.mjs');

const name = process.argv[2];
if (!name) {
  console.error('Usage: node scripts/add-server.mjs <server-name>');
  console.error('Example: node scripts/add-server.mjs io.github.someone/my-server');
  process.exit(1);
}

// Verify the server exists in the MCP registry
console.log(`Looking up "${name}" in the MCP registry...`);
const encoded = encodeURIComponent(name);
const url = `https://registry.modelcontextprotocol.io/v0.1/servers/${encoded}/versions/latest`;
const res = await fetch(url);
if (!res.ok) {
  console.error(`✗ Server not found: ${res.status} ${res.statusText}`);
  console.error(`  Check https://registry.modelcontextprotocol.io for the correct name.`);
  process.exit(1);
}
const data = await res.json();
console.log(`✓ Found: ${data.server.title ?? data.server.name} v${data.server.version}`);

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
