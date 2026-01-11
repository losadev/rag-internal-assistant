import { ChangeEvent, KeyboardEvent } from "react";

type Props = {
  onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void;
  value?: string;
};

export const Input = ({ onChange, onClick, value }: Props) => {
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onClick && onClick();
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
        className="flex-1 border text-app border-app rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary ::placeholder-muted"
      />
      <button
        onClick={() => {
          onClick && onClick();
          value &&
            value.trim() !== "" &&
            onChange &&
            onChange({
              target: { value: "" },
            } as ChangeEvent<HTMLInputElement>);
        }}
        className="bg-primary text-white font-medium p-2 rounded flex items-center gap-2 text-sm hover:bg-primary-light cursor-pointer text-center"
      >
        Send
      </button>
    </div>
  );
};
