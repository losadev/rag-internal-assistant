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
      <p
        className={`${
          role === "user" ? "bg-primary text-white" : "bg-gray-200 text-black"
        } p-3 rounded-lg rounded-default max-w-[85%] md:max-w-2xl break-words overflow-wrap-anywhere`}
      >
        {message}
      </p>
      {role === "user" ? <UserIcon /> : <RobotIcon />}
    </div>
  );
};
