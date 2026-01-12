"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { ConversationCard } from "./_components/ConversationCard";
import { Input } from "./_components/Input";
import { SourceCard } from "./_components/SourceCard";
import { SnippetModal } from "./_components/SnippetModal";
import { LoadingIndicator } from "./_components/LoadingIndicator";
import {
  createConversation,
  createMessage,
  getConversations,
  getMessages,
  clearConversationMessages,
  updateTitleConversation,
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
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sources, setSources] = useState<Array<any>>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<{
    title: string;
    snippet: string;
  } | null>(null);

  // Guardar conversationId en localStorage cuando cambia
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem("lastConversationId", conversationId);
    }
  }, [conversationId]);

  // Guardar sources en localStorage cuando cambian
  useEffect(() => {
    if (conversationId && sources.length > 0) {
      localStorage.setItem(
        `sources_${conversationId}`,
        JSON.stringify(sources)
      );
    }
  }, [sources, conversationId]);

  // Restaurar conversationId y sources al cargar la página
  useEffect(() => {
    const savedConversationId = localStorage.getItem("lastConversationId");
    if (savedConversationId && !conversationId) {
      setConversationId(savedConversationId);

      // Restaurar sources del último chat
      const savedSources = localStorage.getItem(
        `sources_${savedConversationId}`
      );
      if (savedSources) {
        try {
          setSources(JSON.parse(savedSources));
        } catch (e) {
          console.error("Error parsing saved sources:", e);
        }
      }
    }
  }, []);

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

      // Obtener el primer y último mensaje de cada conversación
      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conv) => {
          try {
            const messages = await getMessages(conv.id);
            const firstMessage = messages?.[0]?.content || "Nueva conversación";
            const lastMessage = messages?.[messages.length - 1]?.content || "";
            return {
              ...conv,
              title: firstMessage.substring(0, 50), // Limitar a 50 caracteres
              lastMessage: lastMessage.substring(0, 50), // Limitar a 50 caracteres
            };
          } catch {
            return {
              ...conv,
              title: "Nueva conversación",
              lastMessage: "",
            };
          }
        })
      );

      setConversations(conversationsWithMessages);
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
      setIsLoadingMessages(true);
      const messages = await getMessages(conversationId);
      setActualMessages(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
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
      const userMessage = userInput as string;

      // Mostrar el mensaje del usuario inmediatamente (optimistic update)
      setActualMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage, id: Date.now() },
      ]);

      // Limpiar input inmediatamente
      setUserInput("");

      // Guardar mensaje del usuario en BD
      await createMessage(conversationId, "user", userMessage);

      // Actualizar el título de la conversación con el primer mensaje si es la primera
      const messages = await getMessages(conversationId);
      if (messages.length === 1) {
        // Es el primer mensaje, actualizar el título
        await updateTitleConversation(
          userMessage.substring(0, 50),
          conversationId
        );
      }

      // Obtener respuesta del RAG
      const response = await sendChatMessage(userMessage);

      if (!response) {
        throw new Error("No response from server");
      }

      // Guardar sources
      setSources(response.sources || []);

      // Mostrar respuesta de la IA inmediatamente
      setActualMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer, id: Date.now() },
      ]);

      // Guardar respuesta del LLM en la BD
      await createMessage(conversationId, "assistant", response.answer);

      // Actualizar lista de conversaciones
      await getConversationsList();
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

  const handleDeleteConversation = async (
    convId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!confirm("¿Estás seguro de que deseas eliminar esta conversación?")) {
      return;
    }

    try {
      await clearConversationMessages(convId);
      // Actualizar lista de conversaciones
      await getConversationsList();
      // Si era la conversación activa, limpiar
      if (conversationId === convId) {
        setConversationId("");
        setActualMessages([]);
        setSources([]);
      }
      console.log("✓ Conversación eliminada");
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      alert(`Error al eliminar la conversación: ${error?.message}`);
    }
  };

  return (
    <div className="flex h-full   ">
      {/* Sidebar */}
      <section className="border-r border-app w-64 h-full">
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
                lastMessage={conv.lastMessage}
                isActive={conversationId === conv.id}
                onClick={() => setConversationId(conv.id)}
                onDelete={(e) => handleDeleteConversation(conv.id, e)}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="flex flex-col flex-1 ">
        {/* Chat messages */}
        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-4 space-y-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <LoadingIndicator text="Cargando mensajes" />
            </div>
          ) : (
            <>
              {actualMessages &&
                actualMessages.map((msg, index) => (
                  <ChatMessage
                    key={index}
                    message={msg.content}
                    role={msg.role as "user" | "assistant"}
                  />
                ))}
              {isLoading && <LoadingIndicator />}
            </>
          )}
        </div>
        {/* Input */}
        <div className="border-t border-app p-4 flex-shrink-0 bg-app">
          <div className="flex flex-col gap-2 justify-center px-4">
            <Input
              onChange={handleInputChange}
              onSubmit={() => {
                setSubmittedInput([...submittedInput, userInput]);
                onSend();
              }}
              isLoading={isLoading}
              value={userInput}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSubmittedInput([...submittedInput, userInput]);
                  onSend();
                }}
                disabled={isLoading || !userInput.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-fit"
                title="Enviar mensaje"
              >
                {isLoading ? "Enviando..." : "Enviar"}
              </button>
              <button
                onClick={handleClearChat}
                disabled={isLoading || !conversationId}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-fit"
                title="Limpiar todos los mensajes de esta conversación"
              >
                Limpiar chat
              </button>
            </div>
          </div>
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
                  onClick={() =>
                    setSelectedSnippet({
                      title: source.document,
                      snippet: source.snippet,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Snippet Modal */}
      <SnippetModal
        isOpen={selectedSnippet !== null}
        onClose={() => setSelectedSnippet(null)}
        title={selectedSnippet?.title || ""}
        snippet={selectedSnippet?.snippet || ""}
      />
    </div>
  );
}
