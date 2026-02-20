import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { getProfileTool } from "./tools/get-profile.js";
import { getFrameworksTool } from "./tools/get-frameworks.js";
import { getExperienceTool } from "./tools/get-experience.js";
import { consultTool } from "./tools/consult.js";
import { getContactTool } from "./tools/get-contact.js";
import { getCareerTool } from "./tools/get-career.js";

interface Env {
  DB: D1Database;
  ANALYTICS_TOKEN: string;
}

function withLogging(
  toolName: string,
  handler: (args: any, extra: any) => any,
  db: D1Database,
  country: string | null
) {
  return async (args: any, extra: any) => {
    const params = Object.keys(args).length > 0 ? JSON.stringify(args) : null;
    try {
      await db.prepare(
        "INSERT INTO tool_calls (tool_name, params, country) VALUES (?, ?, ?)"
      ).bind(toolName, params, country).run();
    } catch {}
    return handler(args, extra);
  };
}

function createServer(db: D1Database, country: string | null): McpServer {
  const server = new McpServer({
    name: "pez-mcp-server",
    version: "1.0.0",
  });

  // Register all tools
  server.tool(
    getProfileTool.name,
    getProfileTool.description,
    {},
    withLogging(getProfileTool.name, getProfileTool.handler, db, country)
  );

  server.tool(
    getFrameworksTool.name,
    getFrameworksTool.description,
    { domain: getFrameworksTool.schema.shape.domain },
    withLogging(getFrameworksTool.name, getFrameworksTool.handler, db, country)
  );

  server.tool(
    getExperienceTool.name,
    getExperienceTool.description,
    { domain: getExperienceTool.schema.shape.domain },
    withLogging(getExperienceTool.name, getExperienceTool.handler, db, country)
  );

  server.tool(
    consultTool.name,
    consultTool.description,
    { brief: consultTool.schema.shape.brief },
    withLogging(consultTool.name, consultTool.handler, db, country)
  );

  server.tool(
    getContactTool.name,
    getContactTool.description,
    {},
    withLogging(getContactTool.name, getContactTool.handler, db, country)
  );

  server.tool(
    getCareerTool.name,
    getCareerTool.description,
    {},
    withLogging(getCareerTool.name, getCareerTool.handler, db, country)
  );

  return server;
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, mcp-session-id, MCP-Protocol-Version",
    "Access-Control-Expose-Headers": "mcp-session-id",
  };
}

function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders())) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Analytics endpoint
    if (url.pathname === "/analytics" && request.method === "GET") {
      const token = url.searchParams.get("token");
      if (!token || token !== env.ANALYTICS_TOKEN) {
        return new Response("Unauthorized", { status: 401, headers: corsHeaders() });
      }

      const [recent, byTool, byCountry, total] = await Promise.all([
        env.DB.prepare(
          "SELECT tool_name, params, country, created_at FROM tool_calls ORDER BY created_at DESC LIMIT 100"
        ).all(),
        env.DB.prepare(
          "SELECT tool_name, COUNT(*) as count FROM tool_calls GROUP BY tool_name ORDER BY count DESC"
        ).all(),
        env.DB.prepare(
          "SELECT country, COUNT(*) as count FROM tool_calls GROUP BY country ORDER BY count DESC"
        ).all(),
        env.DB.prepare("SELECT COUNT(*) as count FROM tool_calls").first<{ count: number }>(),
      ]);

      return new Response(
        JSON.stringify({
          total: total?.count ?? 0,
          by_tool: byTool.results,
          by_country: byCountry.results,
          recent: recent.results,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    }

    // MCP endpoint — root path
    if (url.pathname === "/") {
      // GET without session = not an MCP request, return a friendly response
      if (request.method === "GET") {
        const accept = request.headers.get("accept") || "";
        if (!accept.includes("text/event-stream")) {
          return new Response(
            JSON.stringify({
              name: "pez-mcp-server",
              version: "1.0.0",
              description: "Personal MCP server for Pez — 20+ years in digital, entrepreneurship, branding, communication & emerging tech",
              usage: "Connect this URL as a Streamable HTTP MCP server in Claude Desktop or any MCP client.",
            }),
            { headers: { "Content-Type": "application/json", ...corsHeaders() } }
          );
        }
      }

      // Stateless mode: every request gets a fresh server + transport
      const cf = request.cf as { country?: string } | undefined;
      const country = cf?.country ?? null;
      const server = createServer(env.DB, country);
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      await server.connect(transport);
      const response = await transport.handleRequest(request);
      return addCorsHeaders(response);
    }

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders(),
    });
  },
};
