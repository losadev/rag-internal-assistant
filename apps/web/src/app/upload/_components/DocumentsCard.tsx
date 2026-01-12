import { useState, useEffect } from "react";
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
  chunks?: number;
}

export const DocumentsCard = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:8000/documents");
      const data = await res.json();

      if (data.status === "ok") {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/documents/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.status === "success") {
        // Eliminar de la UI
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      } else {
        console.error("Error deleting document:", data.message);
        alert("Error al eliminar el documento");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Error al eliminar el documento");
    }
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
        {isLoading ? (
          <p className="text-muted text-center py-4">Cargando documentos...</p>
        ) : documents.length > 0 ? (
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
                    {doc.size > 0 && <span>{formatFileSize(doc.size)}</span>}
                    {doc.chunks !== undefined && (
                      <span>• {doc.chunks} chunks</span>
                    )}
                    {doc.uploadedAt && <span>• {doc.uploadedAt}</span>}
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
