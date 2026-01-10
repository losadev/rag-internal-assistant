export const SourceCard = ({
  title,
  excerpt,
}: {
  title: string;
  excerpt: string;
}) => {
  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4 hover:bg-gray-100 cursor-pointer">
      {title}
      <p className="text-gray-500 text-sm">{excerpt}</p>
    </div>
  );
};
