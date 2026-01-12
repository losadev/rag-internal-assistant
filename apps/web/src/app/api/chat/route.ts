import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing 'message'" }, { status: 400 });
    }

    const baseUrl = "http://localhost:8000";
    if (!baseUrl) {
      return NextResponse.json(
        { error: "AI_SERVICE_URL not set" },
        { status: 500 }
      );
    }

    const res = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `AI service error: ${res.status}`, details: text },
        { status: 500 }
      );
    }

    const data = await res.json(); // { answer, sources }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected error", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
