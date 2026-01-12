import type { ChatResponse } from "./types";

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  console.log("📤 Sending message to server:", message);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    console.log("📥 Response status:", res.status);

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Server error:", text);
      throw new Error(text || `HTTP ${res.status}: Failed to send message`);
    }

    const data = await res.json();
    console.log("✅ Response received:", data);
    return data;
  } catch (error) {
    console.error("❌ Error in sendChatMessage:", error);
    throw error;
  }
}
