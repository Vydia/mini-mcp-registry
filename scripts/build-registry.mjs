#!/usr/bin/env node
// Generates static registry files for GitHub Pages.
// Enter the full URL in org settings: https://vydia.github.io/mini-mcp-registry/v0.1/servers.json
//
// Files generated:
//   public/v0.1/servers.json                                 → list endpoint (use this URL in org settings)
//   public/v0.1/<name>/versions/latest.json                  → individual server lookup
//   public/allowed-servers.json                              → UI / direct access

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public');

// Add server names here to include them
const ALLOWED_SERVERS = [

];

async function fetchServer(name) {
  const encoded = encodeURIComponent(name);
  const url = `https://registry.modelcontextprotocol.io/v0.1/servers/${encoded}/versions/latest`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.status}`);
  return res.json();
}

function write(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}

console.log('Fetching allowed servers...');
const entries = [];

for (const name of ALLOWED_SERVERS) {
  process.stdout.write(`  ${name}...`);
  const entry = await fetchServer(name);
  entries.push(entry);

  // Individual server lookup: /v0.1/<name>/versions/latest.json
  const serverDir = join(OUT_DIR, 'v0.1', ...name.split('/'));
  write(join(serverDir, 'versions', 'latest.json'), entry);
  write(join(serverDir, 'versions', `${entry.server.version}.json`), entry);
  console.log(` ✓ v${entry.server.version}`);
}

const list = {
  servers: entries,
  metadata: { count: entries.length, nextCursor: null },
};

write(join(OUT_DIR, 'v0.1', 'servers.json'), list);
write(join(OUT_DIR, 'allowed-servers.json'), list);

console.log(`\n✓ public/v0.1/servers.json — ${entries.length} server(s)`);
console.log('✓ public/allowed-servers.json');
