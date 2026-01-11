"use client";
import { createContext, useContext } from "react";

export const ConversationContext = createContext<String | undefined>(undefined);

export function useConversationContext() {
  const conversationId = useContext(ConversationContext);
  if (conversationId === undefined) {
    throw new Error(
      "useConversationContext must be used within a ConversationContext"
    );
  }

  return conversationId;
}
