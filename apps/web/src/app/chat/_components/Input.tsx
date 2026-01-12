import { ChangeEvent, KeyboardEvent, useEffect, useRef } from "react";

type Props = {
  onChange?: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  value?: string;
};

export const Input = ({
  onChange,
  onSubmit,
  isLoading = false,
  value,
}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [value]);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      placeholder="Type your message... (Shift+Enter for new line)"
      onChange={onChange}
      onKeyPress={handleKeyPress}
      value={value}
      disabled={isLoading}
      className="w-full border text-app border-app rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary placeholder-muted disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-y-auto"
      rows={1}
    />
  );
};
