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
} from "@/lib/supabase-queries";
import { ChatProvider } from "@/providers/ChatProvider";
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

  useEffect(() => {
    handleInsertMessage(submittedInput[submittedInput.length - 1] as string);
  }, [submittedInput]);

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
    try {
      const response = await sendChatMessage(userInput as string);
      setLlmMessages([...llmMessages, userInput]);

      // Guardar respuesta del LLM en la BD
      await createMessage(conversationId, "assistant", response.answer);
    } catch (error) {
      console.error("Error submitting input:", error);
    }
  };

  return (
    <ChatProvider>
      <div className="flex bg-card h-full ">
        <section className="border-r border-app h-full overflow-y-auto w-64">
          {/* New chat button */}
          <div className="border-b border-app flex items-center justify-center p-4">
            <button
              onClick={() => {
                handleNewConversation();
              }}
              className="bg-primary text-white font-medium p-2 rounded flex items-center gap-2 text-sm min-w-30 hover:bg-primary-light cursor-pointer text-center flex-1 justify-center"
            >
              + New Chat
            </button>
          </div>
          {/* Conversation */}
          <div className="p-4 text-app flex flex-col h-full ">
            <h1 className="font-semibold">Conversations</h1>
            <div className="mt-4 flex flex-col gap-2 flex-1 ">
              {conversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  title={conversation.title}
                  lastMessage="Last message preview..."
                  onClick={() => {
                    setConversationId(conversation.id);
                  }}
                />
              ))}
            </div>
          </div>
        </section>
        <section className=" flex flex-col flex-1 grow h-full ">
          {/* Chat messages */}
          <div className="flex-1 py-8 px-[20em] space-y-4 overflow-y-auto">
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
          <div className="border-t border-app p-4">
            <Input
              onChange={handleInputChange}
              onClick={() => {
                setSubmittedInput([...submittedInput, userInput]);
                onSend();
              }}
            />
          </div>
        </section>
        {/* Sources */}
        <section className="border-l border-app text-app w-64 h-full overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Sources</h2>
            <div className="flex flex-col gap-4">
              <SourceCard
                title="Source Document 1"
                excerpt="lorem ipsum dolor sit amet"
              />
              <SourceCard
                title="Source Document 2"
                excerpt="consectetur adipiscing elit"
              />
              <SourceCard
                title="Source Document 3"
                excerpt="sed do eiusmod tempor incididunt"
              />
            </div>
          </div>
        </section>
      </div>
    </ChatProvider>
  );
}
