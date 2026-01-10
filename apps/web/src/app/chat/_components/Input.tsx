export const Input = () => {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Type your message..."
        className="flex-1 border text-black border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ::placeholder-gray-400"
      />
      <div className="bg-blue-500 text-white font-medium p-2 rounded flex items-center gap-2 text-sm hover:bg-blue-600 cursor-pointer text-center">
        Send
      </div>
    </div>
  );
};
