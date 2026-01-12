"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DocumentsCard } from "./_components/DocumentsCard";
import { Header } from "./_components/Header";
import { KnowledgeBaseCard } from "./_components/KnowledgeBase Card";
import { UploadFileCard } from "./_components/UploadFileCard";

export default function UploadPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [knowledgeBaseData, setKnowledgeBaseData] = useState({
    documents: 0,
    chunks: 0,
    lastUpdated: "",
  });

  const fetchDocumentsCount = async () => {
    try {
      const res = await fetch("http://localhost:8000/documents/count");
      const data = await res.json();
      if (data.status === "ok") {
        setKnowledgeBaseData({
          documents: data.documents,
          chunks: data.chunks,
          lastUpdated: new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      console.error("Error fetching documents count:", error);
    }
  };

  useEffect(() => {
    fetchDocumentsCount();
  }, []);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    fetchDocumentsCount();
  };

  return (
    <div className="bg-app min-h-screen px-4 md:px-8 lg:px-20 xl:px-40 py-4 md:py-8">
      <Header />
      <section className="mt-4 md:mt-8 flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
        <div className="flex flex-1 flex-col gap-4 md:gap-6">
          <UploadFileCard onUploadSuccess={handleUploadSuccess} />
          <DocumentsCard key={refreshKey} />
        </div>
        <div className="flex-1 lg:max-w-md">
          <KnowledgeBaseCard
            key={refreshKey}
            documents={knowledgeBaseData.documents}
            chunks={knowledgeBaseData.chunks}
            lastUpdated={knowledgeBaseData.lastUpdated}
            onOpenChat={() => router.push("/chat")}
          />
        </div>
      </section>
    </div>
  );
}
