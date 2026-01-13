import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { title, description, priority, context } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const mcpServerUrl = process.env.MCP_SERVER_URL! || "http://localhost:4000";
    const mcpEndpoint = `${mcpServerUrl}/mcp`;

    const payload = {
      jsonrpc: "2.0",
      id: `task_${Date.now()}`,
      method: "tools/call",
      params: {
        name: "create_task",
        arguments: {
          title,
          description,
          priority: (priority || "medium").toLowerCase(),
          context: context || {},
        },
      },
    };

    const res = await fetch(mcpEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: `MCP error ${res.status}`, details: text },
        { status: 500 }
      );
    }

    const rpc = text ? JSON.parse(text) : null;

    // MCP JSON-RPC estándar: { result: { content: [...] } } o { error: ... }
    if (rpc?.error) {
      return NextResponse.json(
        { error: rpc.error.message || "MCP tool error" },
        { status: 500 }
      );
    }

    // Aquí depende de lo que devuelva tu tool: ahora devuelve texto.
    // Mejor: hacer que el tool devuelva JSON en el text, o (ideal) que devuelva structured content.
    const toolText = rpc?.result?.content?.[0]?.text || "";

    // Intentar parsear JSON si viene en texto
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
