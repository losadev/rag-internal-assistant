import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { config } from "../config.js";

const createTaskSchema = z.object({
  title: z.string().min(3).max(120).describe("Título de la tarea"),
  description: z.string().min(5).max(2000).describe("Descripción de la tarea"),
  priority: z.enum(["low", "medium", "high"]).optional().describe("Prioridad"),
  context: z
    .object({
      conversationId: z.string().optional(),
      messageId: z.string().optional(),
    })
    .optional()
    .describe("Contexto opcional para trazabilidad"),
});

type CreateTaskInput = z.infer<typeof createTaskSchema>;

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
      description: "Crea una tarea en Google Sheets vía n8n webhook",
      inputSchema: createTaskSchema,
    },
    async (input: CreateTaskInput) => {
      try {
        if (!config.n8nWebhookUrl) {
          throw new Error("n8n webhook URL is not configured");
        }

        const validated = createTaskSchema.parse(input);

        const payload = {
          title: validated.title,
          description: validated.description,
          priority: validated.priority ?? "medium",
          context: validated.context ?? {},
          timestamp: new Date().toISOString(),
        };

        console.log("📤 Sending task to n8n:", payload);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);

        const response = await fetch(config.n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeout));

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          throw new Error(
            `n8n webhook failed: ${response.status} ${
              errText || response.statusText
            }`
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

        const summary = {
          ok: true,
          taskId: result.taskId ?? null,
          url: result.url ?? null,
        };

        return {
          content: [
            {
              type: "text",
              text:
                `✅ Task created successfully\n` +
                `Title: ${validated.title}\n` +
                `Task ID: ${summary.taskId ?? "N/A"}\n` +
                `URL: ${summary.url ?? "N/A"}\n\n` +
                `Debug:\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
        };
      } catch (error: any) {
        const msg =
          error?.name === "AbortError"
            ? "Request to n8n timed out"
            : error instanceof Error
            ? error.message
            : "Unknown error";

        console.error("❌ Error creating task:", error);

        return {
          content: [{ type: "text", text: `❌ Error creating task: ${msg}` }],
          isError: true,
        };
      }
    }
  );
}
