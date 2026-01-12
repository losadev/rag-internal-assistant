import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";

const mcpServer = new McpServer({
  name: "RAG Internal Assistant",
  version: "1.0.0",
});

// Register all tools
registerAllTools(mcpServer);

const transport = new StdioServerTransport();
await mcpServer.connect(transport);
