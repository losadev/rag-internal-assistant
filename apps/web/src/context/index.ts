"use client";
import { createContext, useContext } from "react";

interface ConversationContextType {
  conversationId: string;
  setConversationId: (id: string) => void;
}

export const ConversationContext = createContext<
  ConversationContextType | undefined
>(undefined);

export function useConversationContext() {
  const conversationId = useContext(ConversationContext);
  if (conversationId === undefined) {
    throw new Error(
      "useConversationContext must be used within a ConversationContext"
    );
  }

  return conversationId;
}
