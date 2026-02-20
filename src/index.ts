import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { getProfileTool } from "./tools/get-profile.js";
import { getFrameworksTool } from "./tools/get-frameworks.js";
import { getExperienceTool } from "./tools/get-experience.js";
import { consultTool } from "./tools/consult.js";
import { getContactTool } from "./tools/get-contact.js";
import { getCareerTool } from "./tools/get-career.js";

function createServer(): McpServer {
  const server = new McpServer({
    name: "pez-mcp-server",
    version: "1.0.0",
  });

  // Register all tools
  server.tool(
    getProfileTool.name,
    getProfileTool.description,
    {},
    getProfileTool.handler
  );

  server.tool(
    getFrameworksTool.name,
    getFrameworksTool.description,
    { domain: getFrameworksTool.schema.shape.domain },
    getFrameworksTool.handler
  );

  server.tool(
    getExperienceTool.name,
    getExperienceTool.description,
    { domain: getExperienceTool.schema.shape.domain },
    getExperienceTool.handler
  );

  server.tool(
    consultTool.name,
    consultTool.description,
    { brief: consultTool.schema.shape.brief },
    consultTool.handler
  );

  server.tool(
    getContactTool.name,
    getContactTool.description,
    {},
    getContactTool.handler
  );

  server.tool(
    getCareerTool.name,
    getCareerTool.description,
    {},
    getCareerTool.handler
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
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
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
      const server = createServer();
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
