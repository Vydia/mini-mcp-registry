#!/usr/bin/env node
// Fetches filtered MCP servers from the v0.1 registry API (server-side search + latest only)
// and writes static JSON files to public/ for deployment.

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public');

const PRESETS = [
  { id: 'figma',    search: 'figma' },
  { id: 'github',   search: 'github' },
  { id: 'notion',   search: 'notion' },
  { id: 'slack',    search: 'slack' },
  { id: 'postgres', search: 'postgres' },
];

async function fetchPage(url, retries = 5) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, (attempt + 1) * 2000));
      continue;
    }
    if (!res.ok) throw new Error(`Registry API error: ${res.status}`);
    return res.json();
  }
  throw new Error('Too many retries due to rate limiting');
}

async function fetchSearch(search) {
  const results = [];
  let cursor = null;

  do {
    const url = new URL('https://registry.modelcontextprotocol.io/v0.1/servers');
    url.searchParams.set('search', search);
    url.searchParams.set('version', 'latest');
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);

    const data = await fetchPage(url.toString());
    results.push(...(data.servers ?? []));
    cursor = data.metadata?.nextCursor ?? null;
  } while (cursor);

  return results;
}

mkdirSync(OUT_DIR, { recursive: true });

for (const preset of PRESETS) {
  process.stdout.write(`  Fetching "${preset.search}"...`);
  const servers = await fetchSearch(preset.search);

  const payload = {
    servers,
    metadata: { count: servers.length, filter: preset.id, generatedAt: new Date().toISOString() },
  };

  writeFileSync(join(OUT_DIR, `${preset.id}.json`), JSON.stringify(payload, null, 2));
  console.log(` ✓ ${servers.length} server(s) → public/${preset.id}.json`);
}

console.log('Done.');
