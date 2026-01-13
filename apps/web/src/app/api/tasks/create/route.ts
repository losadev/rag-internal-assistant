import { NextRequest, NextResponse } from "next/server";

// MCP Protocol Version según la spec
const MCP_PROTOCOL_VERSION = "2025-06-18";

// Track MCP server initialization status
const mcpInitializationState: Map<
  string,
  { initialized: boolean; sessionId?: string }
> = new Map();

/**
 * Construye los headers estándar para peticiones MCP según Streamable HTTP transport
 */
function buildMcpHeaders(
  sessionId?: string,
  lastEventId?: string
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Ambos tipos DEBEN estar en el Accept header según la spec
    Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": MCP_PROTOCOL_VERSION,
  };

  if (sessionId) {
    headers["Mcp-Session-Id"] = sessionId;
  }

  if (lastEventId) {
    headers["Last-Event-ID"] = lastEventId;
  }

  return headers;
}

/**
 * Maneja SSE streams según la spec Streamable HTTP
 */
async function handleSseStream(response: Response): Promise<any> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body available");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let lastJsonRpcResponse: any = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const data = line.slice(5).trim();
          if (data) {
            try {
              const jsonData = JSON.parse(data);
              lastJsonRpcResponse = jsonData;
            } catch (e) {
              // SSE parse error - ignore
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!lastJsonRpcResponse) {
    throw new Error("No JSON-RPC response received in SSE stream");
  }

  return lastJsonRpcResponse;
}

/**
 * Realiza una petición al servidor MCP
 */
async function fetchMcpRequest(
  url: string,
  payload: any,
  sessionId?: string
): Promise<any> {
  const headers = buildMcpHeaders(sessionId);

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  // Extraer nuevo session ID si está disponible
  const newSessionId = response.headers.get("Mcp-Session-Id") || undefined;

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MCP error ${response.status}: ${text}`);
  }

  const contentType = response.headers.get("Content-Type") || "";

  // Manejar SSE streams
  if (contentType.includes("text/event-stream")) {
    const result = await handleSseStream(response);
    return {
      result,
      newSessionId,
    };
  }

  // Manejar respuesta JSON normal
  const text = await response.text();

  // Las notificaciones pueden no devolver body (202 Accepted)
  if (!text) {
    return {
      result: { ok: true },
      newSessionId,
    };
  }

  const result = JSON.parse(text);
  return {
    result,
    newSessionId,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, priority, context } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const mcpServerUrl = process.env.MCP_SERVER_URL || "http://localhost:4000";
    const mcpEndpoint = `${mcpServerUrl}/mcp`;
    const initStateKey = mcpServerUrl;

    // 1. Verificar si el servidor ya está inicializado
    let sessionId: string | undefined;
    let initState = mcpInitializationState.get(initStateKey);

    if (!initState?.initialized) {
      try {
        const initResponse = await fetchMcpRequest(mcpEndpoint, {
          jsonrpc: "2.0",
          id: `init_${Date.now()}`,
          method: "initialize",
          params: {
            protocolVersion: MCP_PROTOCOL_VERSION,
            capabilities: {},
            clientInfo: {
              name: "rag-web-client",
              version: "1.0.0",
            },
          },
        });

        sessionId = initResponse.newSessionId;

        // 2. Enviar InitializedNotification
        try {
          await fetchMcpRequest(
            mcpEndpoint,
            {
              jsonrpc: "2.0",
              method: "initialized",
              params: {},
            },
            sessionId
          );
        } catch (error) {
          // Notification send failed - ignore
        }

        // Guardar estado de inicialización
        mcpInitializationState.set(initStateKey, {
          initialized: true,
          sessionId,
        });
      } catch (error: any) {
        if (
          error.message?.includes("already initialized") ||
          error.message?.includes("Server already initialized")
        ) {
          mcpInitializationState.set(initStateKey, {
            initialized: true,
          });
        } else {
          throw error;
        }
      }
    } else {
      sessionId = initState.sessionId;
    }

    // 3. Llamar al tool create_task
    // Sanitizar context: asegurar que conversationId y messageId sean strings
    const sanitizedContext = context
      ? {
          conversationId: context.conversationId
            ? String(context.conversationId)
            : undefined,
          messageId: context.messageId ? String(context.messageId) : undefined,
        }
      : undefined;

    const mcpResponse = await fetchMcpRequest(
      mcpEndpoint,
      {
        jsonrpc: "2.0",
        id: `task_${Date.now()}`,
        method: "tools/call",
        params: {
          name: "create_task",
          arguments: {
            title,
            description,
            priority: (priority || "medium").toLowerCase(),
            context: sanitizedContext,
          },
        },
      },
      sessionId
    );

    // Verificar si el tool retornó un error
    if (mcpResponse.result.isError) {
      const errorMessage =
        mcpResponse.result.result?.content?.[0]?.text ||
        mcpResponse.result.error?.message ||
        "Unknown error from MCP tool";
      throw new Error(`MCP tool failed: ${errorMessage}`);
    }

    // Extraer el resultado
    const toolText = mcpResponse.result.result?.content?.[0]?.text || "";
    let parsed: any = null;

    try {
      parsed = JSON.parse(toolText);
    } catch {
      parsed = { ok: true, message: toolText };
    }

    return NextResponse.json(parsed, { status: parsed.ok ? 201 : 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Error al crear la tarea" },
      { status: 500 }
    );
  }
}
