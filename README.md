# mini-mcp-registry

A lightweight, self-hosted MCP registry that exposes a filtered subset of the [official MCP registry](https://registry.modelcontextprotocol.io). Deployable to GitHub Pages as a static site.

## Copilot MCP Registry URL

```
https://vydia.github.io/mini-mcp-registry/allowed-servers
```

This endpoint returns only the **official Figma MCP server** (`com.figma.mcp/mcp`) in standard MCP registry format.

## Running locally

```bash
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`. It fetches live from the official registry and filters results by preset.

To preview the production build locally:

```bash
npm run build
npm run preview
```

## How the registry endpoint works

At build time, `scripts/build-registry.mjs` fetches the official Figma server entry from the MCP registry API and writes it to `public/allowed-servers`. Vite copies `public/` into `dist/` unchanged, so the file is served as a static JSON response at `/allowed-servers`.

To regenerate the file manually without a full build:

```bash
node scripts/build-registry.mjs
```

## Adding or changing allowed servers

Edit `scripts/build-registry.mjs`. The relevant section is:

```js
// Fetch a specific server by name + version
const url = 'https://registry.modelcontextprotocol.io/v0.1/servers/com.figma.mcp%2Fmcp/versions/latest';
```

To allow multiple servers, fetch each one and push them into the `servers` array before writing the file:

```js
const figma = await fetchServer('com.figma.mcp%2Fmcp');
const github = await fetchServer('com.github.mcp%2Fgithub');

const payload = {
  servers: [figma, github],
  metadata: { count: 2, nextCursor: null },
};
```

Server names come from the [official registry](https://registry.modelcontextprotocol.io/docs). Use `%2F` to encode the `/` in the server name for the URL.

## Adding UI filter presets

Edit `src/presets.js`:

```js
{
  id: 'linear',
  label: 'Linear',
  search: 'linear',
  description: 'MCP servers that integrate with Linear',
},
```

The `search` value is passed to the registry's `?search=` query param (substring match on server name).

## Deployment

Deploys automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.

**One-time setup:** In the GitHub repo go to **Settings → Pages → Source** and select **GitHub Actions**.

The build step (`npm run build`) runs `scripts/build-registry.mjs` first to fetch fresh server data, then builds the Vite app.
