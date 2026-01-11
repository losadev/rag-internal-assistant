import { ChangeEvent, KeyboardEvent, useRef, useEffect } from "react";
import { SendIcon } from "./SendIcon";

type Props = {
  onChange?: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  onClick?: () => void;
  value?: string;
};

export const Input = ({ onChange, onClick, value }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [value]);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onClick && onClick();
    }
  };

  return (
    <div className="flex justify-center">
      <div className="flex gap-2 w-2xl items-end">
        <textarea
          ref={textareaRef}
          placeholder="Type your message..."
          onChange={onChange as any}
          onKeyPress={handleKeyPress}
          value={value}
          rows={1}
          className="flex-1 border text-app border-app rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <button
          onClick={() => {
            if (value?.trim()) {
              onClick && onClick();
              // Limpiar el input
              onChange?.({
                target: { value: "" },
              } as any);
            }
          }}
          className="bg-primary text-white font-medium p-2 rounded hover:bg-primary-light cursor-pointer"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};
