import { ConversationCard } from "./_components/ConversationCard";
import { Input } from "./_components/Input";
import { SourceCard } from "./_components/SourceCard";

export default function ChatPage() {
  return (
    <div className="flex bg-card h-full  min-h-screen">
      <section className="border-r border-app min-h-full">
        {/* New chat button */}
        <div className="border-b border-app flex items-center justify-center p-4">
          <button className="bg-primary text-white font-medium p-2 rounded flex items-center gap-2 text-sm min-w-30 hover:bg-primary-light cursor-pointer text-center flex-1 justify-center">
            + New Chat
          </button>
        </div>
        {/* Conversation */}
        <div className="px-4 text-app">
          <div className="mt-4 flex flex-col gap-2">
            <ConversationCard
              title="Conversation 1"
              lastMessage="Last message preview..."
            />
          </div>
        </div>
      </section>
      <section className="flex flex-col h-screen flex-1">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto"></div>

        {/* Input */}
        <div className="border-t border-app p-4">
          <Input />
        </div>
      </section>
      {/* Sources */}
      <section className="border-l border-app text-app w-64">
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
