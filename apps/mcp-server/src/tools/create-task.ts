import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { config } from "../config.js";

const createTaskSchema = z.object({
  title: z.string().describe("The title of the task"),
  description: z.string().describe("The description of the task"),
});

// Schema for n8n webhook response
const n8nResponseSchema = z.object({
  ok: z.boolean(),
  taskId: z.string().optional(),
  url: z.string().optional(),
  error: z.string().optional(),
});

export function registerCreateTaskTool(server: McpServer) {
  server.registerTool(
    "create_task",
    {
      title: "Create Task",
      description: "Create a task with a title and description via n8n webhook",
      inputSchema: createTaskSchema,
    },
    async (input: any) => {
      try {
        const validated = createTaskSchema.parse(input);

        console.log("📤 Sending task to n8n:", validated);

        if (!config.n8nWebhookUrl) {
          throw new Error("n8n webhook URL is not configured");
        }

        // Call n8n webhook
        const response = await fetch(config.n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: validated.title,
            description: validated.description,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(
            `n8n webhook failed: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const result = n8nResponseSchema.parse(data);

        console.log("✅ n8n response:", result);

        if (!result.ok) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Failed to create task: ${
                  result.error || "Unknown error"
                }`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `✅ Task created successfully!\n\nTitle: ${
                validated.title
              }\nDescription: ${validated.description}\nTask ID: ${
                result.taskId || "N/A"
              }\nURL: ${result.url || "N/A"}`,
            },
          ],
        };
      } catch (error) {
        console.error("❌ Error creating task:", error);

        return {
          content: [
            {
              type: "text",
              text: `❌ Error creating task: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
