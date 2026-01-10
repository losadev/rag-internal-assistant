export const SourceCard = ({
  title,
  excerpt,
}: {
  title: string;
  excerpt: string;
}) => {
  return (
    <div className="rounded-lg border border-app bg-card p-4 hover:bg-muted cursor-pointer">
      {title}
      <p className="text-muted text-sm">{excerpt}</p>
    </div>
  );
};
