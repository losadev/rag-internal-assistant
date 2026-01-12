import express from "express";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAllTools } from "./tools/index.js";

const app = express();
app.use(express.json({ limit: "2mb" }));

const mcpServer = new McpServer({
  name: "RAG Internal Assistant",
  version: "1.0.0",
});

registerAllTools(mcpServer);

/**
 * Stateful mode (recomendado para server en Render):
 * - genera sessionId
 * - mantiene estado en memoria
 */
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
});

// Conecta el server al transport UNA vez
await mcpServer.connect(transport);

app.post("/mcp", (req, res) => {
  // OJO: según tu doc, si ya tienes body parseado, pásalo como 3er parámetro
  transport.handleRequest(req, res, req.body);
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`[http] MCP server running at http://localhost:${PORT}/mcp`);
});
