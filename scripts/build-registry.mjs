#!/usr/bin/env node
// Fetches the official Figma MCP server from the registry and writes:
//   public/v0.1/servers       — Copilot org registry endpoint (base URL: https://vydia.github.io/mini-mcp-registry)
//   public/allowed-servers    — legacy / direct access

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public');

async function fetchFigmaOfficial() {
  const url = 'https://registry.modelcontextprotocol.io/v0.1/servers/com.figma.mcp%2Fmcp/versions/latest';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Registry API error: ${res.status}`);
  return res.json();
}

mkdirSync(join(OUT_DIR, 'v0.1'), { recursive: true });

console.log('Fetching official Figma MCP server...');
const entry = await fetchFigmaOfficial();

const payload = {
  servers: [entry],
  metadata: {
    count: 1,
    nextCursor: null,
  },
};

const json = JSON.stringify(payload, null, 2);
writeFileSync(join(OUT_DIR, 'v0.1', 'servers'), json);
console.log('✓ public/v0.1/servers written');
writeFileSync(join(OUT_DIR, 'allowed-servers'), json);
console.log('✓ public/allowed-servers written');
