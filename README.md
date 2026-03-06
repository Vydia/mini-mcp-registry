# mini-mcp-registry

A lightweight, self-hosted MCP registry proxy that exposes a curated subset of the [GitHub MCP registry](https://github.com/mcp). Deployed to Vercel.

## Registry URL

```
https://mini-mcp-registry.vercel.app
```

## Managing servers

**Add a server** using its ID from the [GitHub MCP registry](https://github.com/mcp):

```bash
npm run add-server -- com.figma.mcp/mcp
```

**Remove a server:**

```bash
npm run remove-server -- com.figma.mcp/mcp
```

Both scripts rebuild the static JSON files automatically. Commit and push to deploy via Vercel.

## Local development

```bash
npm install
npm run dev        # start dev server at http://localhost:5173
npm run build      # fetch latest server data + build
```
