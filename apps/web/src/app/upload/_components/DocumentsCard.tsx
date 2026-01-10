import { DeleteIcon } from "@/app/_components/DeleteIcon";
import { DocumentIcon } from "@/app/_components/DocumentIcon";
import { Tag } from "./Tag";

export interface DocumentsCardProps {
  format?: string;
  weight?: string;
  timestamp?: string;
}

const Document = ({ format, weight, timestamp }: DocumentsCardProps) => {
  return (
    <div className="flex  justify-between border border-app rounded-lg p-4 items-center">
      <div className="flex items-center gap-6">
        <DocumentIcon size={24} className="w-6 h-6 text-primary" />
        <div className="flex flex-col">
          <h2 className="font-semibold text-app">Document Title</h2>
          <div className="text-muted space-x-2">
            <span>{format}</span>
            <span>{weight}</span>
            <span>{timestamp}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Tag variant="indexed" label="Indexed" />
        <button
          className="hover:bg-red-50 p-2 rounded cursor-pointer"
          title="Delete document"
        >
          <DeleteIcon size={20} className="w-5 h-5 text-primary" />
        </button>
      </div>
    </div>
  );
};

export const DocumentsCard = () => {
  return (
    <div className="border border-gray-300 rounded-lg p-8">
      <h1 className="text-black font-semibold text-lg">Documents</h1>
      <div className="flex flex-col gap-2 mt-4">
        <Document format="PDF" weight="2MB" timestamp="2024-06-01" />
        <Document format="DOCX" weight="1MB" timestamp="2024-05-28" />
        <Document format="TXT" weight="500KB" timestamp="2024-05-30" />
      </div>
    </div>
  );
};
