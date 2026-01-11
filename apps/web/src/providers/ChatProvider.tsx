"use client";
import { ReactNode, useState, useEffect } from "react";
import { ConversationContext } from "@/context";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [actualConversationId, setActualConversationId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Recuperar el conversationId del localStorage al montar
  useEffect(() => {
    const savedConversationId = localStorage.getItem("conversationId");
    if (savedConversationId) {
      setActualConversationId(savedConversationId);
    }
    setIsLoaded(true);
  }, []);

  // Guardar el conversationId en localStorage cuando cambie
  useEffect(() => {
    if (isLoaded && actualConversationId) {
      localStorage.setItem("conversationId", actualConversationId);
    }
  }, [actualConversationId, isLoaded]);

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
