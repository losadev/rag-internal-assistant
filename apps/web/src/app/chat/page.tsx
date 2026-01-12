"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { ConversationCard } from "./_components/ConversationCard";
import { Input } from "./_components/Input";
import { SourceCard } from "./_components/SourceCard";
import {
  createConversation,
  createMessage,
  getConversations,
  getMessages,
  clearConversationMessages,
} from "@/lib/supabase-queries";
import { useConversationContext } from "@/context";
import { sendChatMessage } from "@/lib/api";
import { ChatMessage } from "./_components/ChatMessage";

export default function ChatPage() {
  const [userInput, setUserInput] = useState<String>("");
  const [submittedInput, setSubmittedInput] = useState<String[]>([]);
  const [conversations, setConversations] = useState<Array<any>>([]);
  const { conversationId, setConversationId } = useConversationContext();
  const [actualMessages, setActualMessages] = useState<Array<any>>([]);
  const [llmMessages, setLlmMessages] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<Array<any>>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleNewConversation = async () => {
    try {
      const conversation = await createConversation();
      setConversationId(conversation.id);
      console.log("New conversation created:", conversation);
    } catch (e: any) {
      console.error("Error creating conversation:", e.message);
    }
  };

  const getConversationsList = async () => {
    try {
      const conversations = await getConversations();
      setConversations(conversations);
    } catch (e: any) {
      console.error("Error fetching conversations:", e.message);
    }
  };

  useEffect(() => {
    getConversationsList();
  }, [handleNewConversation]);

  const handleInsertMessage = async (message: string) => {
    try {
      await createMessage(conversationId, "user", message);
    } catch (error) {}
  };

  const getMessagesFromDb = async () => {
    try {
      const messages = await getMessages(conversationId);
      setActualMessages(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (conversationId) {
      getMessagesFromDb();
    }
  }, [conversationId]);

  const onSend = async () => {
    if (isLoading || !userInput.trim()) return;

    try {
      setIsLoading(true);

      // Guardar mensaje del usuario
      await createMessage(conversationId, "user", userInput as string);

      // Obtener respuesta del RAG
      const response = await sendChatMessage(userInput as string);

      if (!response) {
        throw new Error("No response from server");
      }

      // Guardar sources
      setSources(response.sources || []);

      // Guardar respuesta del LLM en la BD
      await createMessage(conversationId, "assistant", response.answer);

      // Limpiar input
      setUserInput("");

      // Actualizar mensajes en pantalla
      await getMessagesFromDb();
    } catch (error: any) {
      console.error("Error submitting input:", error);
      alert(`Error: ${error?.message || "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!conversationId) {
      alert("No hay conversación activa");
      return;
    }

    if (
      !confirm(
        "¿Estás seguro de que deseas borrar todos los mensajes de esta conversación?"
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await clearConversationMessages(conversationId);
      setActualMessages([]);
      console.log("✓ Conversación limpiada");
    } catch (error: any) {
      console.error("Error clearing chat:", error);
      alert(`Error al limpiar el chat: ${error?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-app overflow-hidden">
      {/* Sidebar */}
      <section className="border-r border-app w-64 h-screen overflow-y-auto">
        <div className="p-4">
          <button
            onClick={handleNewConversation}
            className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            + New Conversation
          </button>
          <div className="mt-4 space-y-2">
            {conversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                title={conv.title}
                isActive={conversationId === conv.id}
                onClick={() => setConversationId(conv.id)}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Chat messages */}
        <div className="flex-1 min-h-0 overflow-y-auto px-[20em] py-4 space-y-4">
          {actualMessages &&
            actualMessages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg.content}
                role={msg.role as "user" | "assistant"}
              />
            ))}
        </div>
        {/* Input */}
        <div className="border-t border-app p-4 flex gap-2 flex-shrink-0 bg-app">
          <Input
            onChange={handleInputChange}
            onClick={() => {
              setSubmittedInput([...submittedInput, userInput]);
              onSend();
            }}
            isLoading={isLoading}
            value={userInput}
          />
          <button
            onClick={handleClearChat}
            disabled={isLoading || !conversationId}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            title="Limpiar todos los mensajes de esta conversación"
          >
            Limpiar chat
          </button>
        </div>
      </section>
      {/* Sources */}
      <section className="border-l border-app text-app w-64 h-screen overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Sources</h2>
          {sources.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">
              No sources yet
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {sources.map((source, index) => (
                <SourceCard
                  key={index}
                  title={source.document}
                  snippet={source.snippet}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
