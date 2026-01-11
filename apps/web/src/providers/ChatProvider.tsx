"use client";
import { ReactNode, useState } from "react";
import { ConversationContext } from "@/context";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [actualConversationId, setActualConversationId] = useState<string>("");

  console.log("ChatProvider - conversationId:", actualConversationId);

  return (
    <ConversationContext.Provider
      value={{
        conversationId: actualConversationId,
        setConversationId: setActualConversationId,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
