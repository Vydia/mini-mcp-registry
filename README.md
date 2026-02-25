# mini-mcp-registry

A lightweight, self-hosted MCP registry proxy that exposes a curated subset of the [official MCP registry](https://registry.modelcontextprotocol.io). Deployed to Vercel.

## Registry URL

```
https://mini-mcp-registry.vercel.app
```

## Managing servers

**Add a server** using its name from the [official registry](https://registry.modelcontextprotocol.io):

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
