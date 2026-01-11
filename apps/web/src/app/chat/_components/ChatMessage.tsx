import { RobotIcon } from "./RobotIcon";
import { UserIcon } from "./UserIcon";

export const ChatMessage = ({
  message,
  role,
}: {
  message: string;
  role: "user" | "assistant";
}) => {
  return (
    <div
      className={`flex gap-4 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <p
        className={`${
          role === "user" ? "bg-primary text-white" : "bg-white text-black"
        } p-3 rounded-lg rounded-default max-w-2xl break-words`}
      >
        {message}
      </p>
      {role === "user" ? <UserIcon /> : <RobotIcon />}
    </div>
  );
};
