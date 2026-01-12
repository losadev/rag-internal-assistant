export const SourceCard = ({
  title,
  snippet,
}: {
  title: string;
  snippet: string;
}) => {
  return (
    <div className="rounded-lg border border-app bg-card p-4 hover:bg-gray-300 cursor-pointer transition-colors">
      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{title}</h3>
      <p className="text-muted text-xs line-clamp-3 leading-relaxed">
        {snippet}
      </p>
    </div>
  );
};
