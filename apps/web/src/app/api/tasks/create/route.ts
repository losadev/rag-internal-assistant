import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, context } = body;

    // Validar campos requeridos
    if (!title || !description || !priority) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (title.length < 3 || description.length < 5) {
      return NextResponse.json(
        { error: "Título y descripción deben cumplir requisitos mínimos" },
        { status: 400 }
      );
    }

    // Llamar al servidor MCP para crear la tarea
    const mcpServerUrl = process.env.MCP_SERVER_URL || "http://localhost:3000";

    const mcpResponse = await fetch(`${mcpServerUrl}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `task_${Date.now()}`,
        method: "tools/call",
        params: {
          name: "create_task",
          arguments: {
            title,
            description,
            priority: priority.toLowerCase(),
            context,
          },
        },
      }),
    });

    if (!mcpResponse.ok) {
      throw new Error(
        `MCP server error: ${mcpResponse.status} ${mcpResponse.statusText}`
      );
    }

    const mcpResult = await mcpResponse.json();

    // Extraer el resultado de la respuesta MCP
    const result = mcpResult.result?.content?.[0]?.text;
    let parsedResult;

    if (result) {
      try {
        parsedResult = JSON.parse(result);
      } catch {
        parsedResult = {
          ok: false,
          error: "Error al procesar respuesta del MCP",
        };
      }
    } else {
      parsedResult = mcpResult.result || {
        ok: false,
        error: "Sin respuesta del MCP",
      };
    }

    return NextResponse.json(parsedResult, {
      status: parsedResult.ok ? 201 : 400,
    });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear la tarea" },
      { status: 500 }
    );
  }
}
