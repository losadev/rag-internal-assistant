import { ChangeEvent } from "react";

type Props = {
  onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void;
};

export const Input = ({ onChange, onClick }: Props) => {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Type your message..."
        onChange={onChange}
        className="flex-1 border text-app border-app rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary ::placeholder-muted"
      />
      <button
        onClick={onClick}
        className="bg-primary text-white font-medium p-2 rounded flex items-center gap-2 text-sm hover:bg-primary-light cursor-pointer text-center"
      >
        Send
      </button>
    </div>
  );
};
