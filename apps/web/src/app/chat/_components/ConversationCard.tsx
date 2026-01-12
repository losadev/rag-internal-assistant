import { DeleteIcon } from "../../_components/DeleteIcon";

type Props = {
  title: string;
  lastMessage?: string;
  onClick?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  isActive?: boolean;
};

export const ConversationCard = ({
  title,
  lastMessage,
  onClick,
  onDelete,
  isActive,
}: Props) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-app p-3 cursor-pointer transition-colors relative group ${
        isActive ? "bg-primary text-white" : "bg-card hover:bg-gray-200"
      } hover:bg-gray-200`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold line-clamp-1 text-sm">{title}</h3>
          {lastMessage && (
            <p
              className={`text-xs line-clamp-1 mt-1 ${
                isActive ? "text-white opacity-80" : "text-muted"
              }`}
            >
              {lastMessage}
            </p>
          )}
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1"
          title="Eliminar conversación"
        >
          <DeleteIcon className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
};
