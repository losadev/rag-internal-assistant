import { RobotIcon } from "./RobotIcon";
import { UserIcon } from "./UserIcon";
import { Source } from "@/lib/types";

export const ChatMessage = ({
  message,
  role,
  sources,
  onCreateTask,
}: {
  message: string;
  role: "user" | "assistant";
  sources?: Source[];
  onCreateTask?: () => void;
}) => {
  const hasSources = sources && sources.length > 0;

  return (
    <div
      className={`flex gap-4 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`${
          role === "user" ? "order-2" : "order-1"
        } flex flex-col gap-2`}
      >
        <p
          className={`${
            role === "user" ? "bg-primary text-white" : "bg-gray-200 text-black"
          } p-3 rounded-lg rounded-default max-w-[85%] md:max-w-2xl break-words overflow-wrap-anywhere`}
        >
          {message}
        </p>
        {role === "assistant" && hasSources && onCreateTask && (
          <button
            onClick={onCreateTask}
            className="self-start px-3 py-1 text-sm bg-green-400 hover:bg-green-500 text-white rounded-md transition-colors"
          >
            Create task
          </button>
        )}
      </div>
      {role === "user" ? (
        <UserIcon />
      ) : (
        <div className="order-3">
          <RobotIcon />
        </div>
      )}
    </div>
  );
};
