# Pez MCP Server

Personal MCP server that exposes my professional expertise as a Brand & Communication Strategist. Connect it to any MCP-compatible LLM (Claude, etc.) and get a preview of how I think, what frameworks I use, and how I'd approach your strategic challenges.

## What is this?

This is a [Model Context Protocol](https://modelcontextprotocol.io/) server. When you connect it to an AI assistant like Claude, the assistant gains access to my professional profile, strategic frameworks, experience, and can even simulate a consulting conversation using my methodology.

Think of it as a "strategic preview" — you ask a question, and the AI responds using my actual frameworks and experience as context.

## Available Tools

| Tool | Description |
|------|-------------|
| `get_profile` | Who I am — background, expertise areas, professional philosophy |
| `get_frameworks` | How I think — strategic frameworks and methodologies (filterable by domain) |
| `get_experience` | What I've done — track record and results (filterable by domain) |
| `consult` | Ask me anything — provide a brief and get a structured strategic response |
| `get_contact` | How to reach me — contact info and engagement options |

## How to Connect

### Claude Desktop

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "pez": {
      "url": "https://mcp.pezbot.it"
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add pez --transport streamable-http https://mcp.pezbot.it
```

### Other MCP Clients

Any MCP client that supports Streamable HTTP transport can connect using:

```
https://mcp.pezbot.it
```

## Example Prompts

Once connected, try asking:

1. **Get to know Pez:**
   > "Who is Pez and what does he do?"

2. **Explore frameworks:**
   > "What frameworks does Pez use for brand positioning?"

3. **Get strategic advice (the killer feature):**
   > "I'm launching a B2B SaaS product in the Italian market. The space has two dominant players. How should I approach positioning and go-to-market communication?"

4. **Specific domain questions:**
   > "I need to build a thought leadership strategy for our CEO. What would Pez recommend?"

5. **Contact for real engagement:**
   > "I'd like to work with Pez. What are the options?"

## For Me (Development & Deploy)

### Prerequisites

- Node.js 18+
- A Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Local Development

```bash
npm install
npm run dev
```

The server starts at `http://localhost:8787`. MCP endpoint: `http://localhost:8787`.

### Deploy to Cloudflare Workers

```bash
wrangler login    # First time only
npm run deploy
```

### Updating Content

All content lives in `src/data/`:

- **`profile.json`** — Your bio, expertise, philosophy
- **`frameworks.json`** — Strategic frameworks by domain (brand_positioning, communication_planning, content_strategy)
- **`experience.json`** — Case studies by domain
- **`contact.json`** — Contact info and engagement options

Edit the JSON files, then `npm run deploy` to push updates.

### Project Structure

```
pez-mcp-server/
├── src/
│   ├── index.ts              # Entry point, MCP server setup, Cloudflare Worker handler
│   ├── tools/
│   │   ├── get-profile.ts    # Tool: who I am
│   │   ├── get-frameworks.ts # Tool: how I think
│   │   ├── get-experience.ts # Tool: what I've done
│   │   ├── consult.ts        # Tool: ask Pez (the killer tool)
│   │   └── get-contact.ts    # Tool: how to reach me
│   └── data/
│       ├── profile.json      # Bio and expertise
│       ├── frameworks.json   # Methodological frameworks by domain
│       ├── experience.json   # Experience and results
│       └── contact.json      # Contact and engagement options
├── wrangler.toml             # Cloudflare Workers config
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
