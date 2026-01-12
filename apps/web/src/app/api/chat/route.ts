import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    console.log("[API] Chat request received:", message);

    if (!message || typeof message !== "string") {
      console.error("[API] Invalid message:", message);
      return NextResponse.json({ error: "Missing 'message'" }, { status: 400 });
    }

    const baseUrl = "http://localhost:8000";
    if (!baseUrl) {
      console.error("[API] No base URL configured");
      return NextResponse.json(
        { error: "AI_SERVICE_URL not set" },
        { status: 500 }
      );
    }

    console.log("[API] Calling Python service at:", `${baseUrl}/chat`);

    const res = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      cache: "no-store",
    });

    console.log("[API] Python service response status:", res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error("[API] Python service error:", text);
      return NextResponse.json(
        { error: `AI service error: ${res.status}`, details: text },
        { status: 500 }
      );
    }

    const data = await res.json(); // { answer, sources }
    console.log("[API] Response data:", data);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
