"use client";

import { useRouter } from "next/navigation";
import { DocumentsCard } from "./_components/DocumentsCard";
import { Header } from "./_components/Header";
import { KnowledgeBaseCard } from "./_components/KnowledgeBase Card";
import { UploadFileCard } from "./_components/UploadFileCard";

export default function UploadPage() {
  const router = useRouter();
  return (
    <div className="bg-app min-h-screen px-40 py-8">
      <Header />
      <section className="mt-8 flex gap-8">
        <div className="flex flex-2 flex-col gap-6">
          <UploadFileCard />
          <DocumentsCard />
        </div>
        <div className="flex-1">
          <KnowledgeBaseCard
            documents={2}
            chunks={84}
            lastUpdated="2026-01-08"
            onOpenChat={() => router.push("/chat")}
          />
        </div>
      </section>
    </div>
  );
}
