import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCreateTaskTool } from "./create-task.js";

export function registerAllTools(server: McpServer) {
  registerCreateTaskTool(server);
  // Add more tools here as needed
}
