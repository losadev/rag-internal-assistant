"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { ConversationCard } from "./_components/ConversationCard";
import { Input } from "./_components/Input";
import { SourceCard } from "./_components/SourceCard";
import {
  createConversation,
  getConversations,
  updateTitleConversation,
} from "@/lib/supabase-queries";

export default function ChatPage() {
  const [userInput, setUserInput] = useState<String>("");
  const [submittedInput, setSubmittedInput] = useState<String[]>([]);
  const [conversations, setConversations] = useState<Array<any>>([]);
  const [actualConversationId, setActualConversationId] = useState<String>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleNewConversation = async () => {
    try {
      const conversation = await createConversation();
      setActualConversationId(conversation.id);

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

  return (
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
        <div className="px-4 text-app bg-orange-500 overflow-y-scroll">
          <div className="mt-4 flex flex-col gap-2">
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                title={conversation.title}
                lastMessage="Last message preview..."
                onClick={() => {
                  setActualConversationId(conversation.id);
                }}
              />
            ))}
          </div>
        </div>
      </section>
      <section className=" flex flex-col flex-1 grow h-full">
        {/* Chat messages */}
        <div className=" overflow-y-auto flex-1 text-black">
          {submittedInput}
          {actualConversationId}
        </div>
        {/* Input */}
        <div className="border-t border-app p-4">
          <Input
            onChange={handleInputChange}
            onClick={() => {
              setSubmittedInput([...submittedInput, userInput]);
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
  );
}
