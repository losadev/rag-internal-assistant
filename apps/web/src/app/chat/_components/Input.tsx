export const Input = () => {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Type your message..."
        className="flex-1 border text-app border-app rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary ::placeholder-muted"
      />
      <div className="bg-primary text-white font-medium p-2 rounded flex items-center gap-2 text-sm hover:bg-primary-light cursor-pointer text-center">
        Send
      </div>
    </div>
  );
};
