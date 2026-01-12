import { ChangeEvent, KeyboardEvent } from "react";

type Props = {
  onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void;
  isLoading?: boolean;
  value?: string;
};

export const Input = ({
  onChange,
  onClick,
  isLoading = false,
  value,
}: Props) => {
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Type your message..."
        onChange={onChange}
        onKeyPress={handleKeyPress}
        value={value}
        disabled={isLoading}
        className="flex-1 border text-app border-app rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary ::placeholder-muted disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        onClick={onClick}
        disabled={isLoading}
        className="bg-primary text-white font-medium p-2 rounded flex items-center gap-2 text-sm hover:bg-primary-light cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Enviando..." : "Send"}
      </button>
    </div>
  );
};
