"use client";
import { ReactNode, useState } from "react";
import { ConversationContext } from "@/context";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [actualConversationId, setActualConversationId] = useState<string>("");

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
