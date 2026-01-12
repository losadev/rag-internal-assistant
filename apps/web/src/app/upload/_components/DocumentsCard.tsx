import { useState } from "react";
import { DeleteIcon } from "@/app/_components/DeleteIcon";
import { DocumentIcon } from "@/app/_components/DocumentIcon";
import { Tag } from "./Tag";

interface Document {
  id: string;
  name: string;
  format: string;
  size: number;
  uploadedAt: string;
  status: string;
}

export const DocumentsCard = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Document 1",
      format: "PDF",
      size: 2097152,
      uploadedAt: "2024-06-01",
      status: "Indexed",
    },
    {
      id: "2",
      name: "Document 2",
      format: "DOCX",
      size: 1048576,
      uploadedAt: "2024-05-28",
      status: "Indexed",
    },
    {
      id: "3",
      name: "Document 3",
      format: "TXT",
      size: 512000,
      uploadedAt: "2024-05-30",
      status: "Indexed",
    },
  ]);

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  };

  return (
    <div className="border border-gray-300 rounded-lg p-8">
      <h1 className="text-black font-semibold text-lg">Documents</h1>
      <div className="flex flex-col gap-2 mt-4">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex justify-between border border-app rounded-lg p-4 items-center"
            >
              <div className="flex items-center gap-6">
                <DocumentIcon size={24} className="w-6 h-6 text-primary" />
                <div className="flex flex-col">
                  <h2 className="font-semibold text-app">{doc.name}</h2>
                  <div className="text-muted space-x-2">
                    <span>{doc.format}</span>
                    <span>{formatFileSize(doc.size)}</span>
                    <span>{doc.uploadedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Tag variant="indexed" label={doc.status} />
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="hover:bg-red-50 p-2 rounded cursor-pointer"
                  title="Delete document"
                >
                  <DeleteIcon size={20} className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted text-center py-4">
            No documents uploaded yet
          </p>
        )}
      </div>
    </div>
  );
};
