"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DocumentsCard } from "./_components/DocumentsCard";
import { Header } from "./_components/Header";
import { KnowledgeBaseCard } from "./_components/KnowledgeBase Card";
import { UploadFileCard } from "./_components/UploadFileCard";

export default function UploadPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [knowledgeBaseData, setKnowledgeBaseData] = useState({
    documents: 3,
    chunks: 84,
    lastUpdated: "2026-01-08",
  });

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setKnowledgeBaseData((prev) => ({
      ...prev,
      documents: prev.documents + 1,
      lastUpdated: new Date().toISOString().split("T")[0],
    }));
  };

  return (
    <div className="bg-app min-h-screen px-40 py-8">
      <Header />
      <section className="mt-8 flex gap-8">
        <div className="flex flex-2 flex-col gap-6">
          <UploadFileCard onUploadSuccess={handleUploadSuccess} />
          <DocumentsCard key={refreshKey} />
        </div>
        <div className="flex-1">
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
