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

// Add server IDs here to include them (use the IDs from github.com/mcp, e.g. 'com.figma.mcp/mcp')
const ALLOWED_SERVERS = [
  'com.figma.mcp/mcp',
  'microsoft/playwright-mcp',
];

const GITHUB_MCP_BASE = 'https://github.com/mcp';

async function fetchServer(id) {
  const url = `${GITHUB_MCP_BASE}/${id}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const json = await res.json();
  return json.payload.mcpDetailsRoute.server_data;
}

function mapServer(ghServer) {
  return {
    server: {
      name: ghServer.id,
      title: ghServer.display_name,
      description: ghServer.description ?? '',
      version: ghServer.created_at,
      repository: {
        url: ghServer.repository.url,
        source: ghServer.repository.source,
      },
    },
    _meta: {
      updatedAt: ghServer.updated_at,
      stars: ghServer.stargazer_count,
    },
  };
}

function write(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}

console.log('Fetching servers from github.com/mcp...');
const entries = [];

for (const name of ALLOWED_SERVERS) {
  process.stdout.write(`  ${name}...`);
  const ghServer = await fetchServer(name);
  const entry = mapServer(ghServer);
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
