type Props = {
  title: string;
  lastMessage: string;
  onClick?: () => void;
};

export const ConversationCard = ({ title, lastMessage, onClick }: Props) => {
  return (
    <div
      onClick={onClick}
      className="rounded-lg border border-app bg-card p-3 hover:bg-gray-200 cursor-pointer"
    >
      <h3 className="font-semibold text-app">{title}</h3>
      <p className="text-muted text-sm">{lastMessage}</p>
    </div>
  );
};
