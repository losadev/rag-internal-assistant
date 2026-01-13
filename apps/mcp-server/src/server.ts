import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAllTools } from "./tools/index.js";

async function main() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  // Healthcheck para Render
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Auth mínima (opcional pero recomendado)
  app.use((req, res, next) => {
    const key = process.env.MCP_API_KEY;
    if (!key) return next();

    const auth = req.headers.authorization || "";
    if (auth !== `Bearer ${key}`) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }
    next();
  });

  const mcpServer = new McpServer({
    name: "RAG Internal Assistant",
    version: "1.0.0",
  });

  registerAllTools(mcpServer);

  // ✅ Stateless: más estable para Next/Vercel + Render
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await mcpServer.connect(transport);

  app.post("/mcp", (req, res) => {
    try {
      transport.handleRequest(req, res, req.body);
    } catch (err) {
      res.status(500).json({ ok: false, error: "MCP handleRequest error" });
    }
  });

  const PORT = Number(process.env.PORT || 4000);
  app.listen(PORT, () => {
    // Server started
  });
}

main().catch((err) => {
  process.exit(1);
});
