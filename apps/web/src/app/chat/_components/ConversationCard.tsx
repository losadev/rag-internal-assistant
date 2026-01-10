type Props = {
  title: string;
  lastMessage: string;
};

export const ConversationCard = ({ title, lastMessage }: Props) => {
  return (
    <div className="rounded-lg border border-gray-300 bg-white p-3 hover:bg-gray-100 cursor-pointer">
      <h3 className="font-semibold text-black">{title}</h3>
      <p className="text-gray-500 text-sm">{lastMessage}</p>
    </div>
  );
};
