type Props = {
  title: string;
  lastMessage: string;
};

export const ConversationCard = ({ title, lastMessage }: Props) => {
  return (
    <div className="rounded-lg border border-app bg-card p-3 hover:bg-muted cursor-pointer">
      <h3 className="font-semibold text-app">{title}</h3>
      <p className="text-muted text-sm">{lastMessage}</p>
    </div>
  );
};
