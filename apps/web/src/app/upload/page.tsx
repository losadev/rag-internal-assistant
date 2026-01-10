import { DocumentsCard } from "./_components/DocumentsCard";
import { Header } from "./_components/Header";
import { UploadFileCard } from "./_components/UploadFileCard";

export default function UploadPage() {
  return (
    <div className=" bg-white min-h-screen p-4">
      <Header />
      <section className="mt-8 flex">
        <div className="w-full flex flex-col gap-6">
          <UploadFileCard />
          <DocumentsCard />
        </div>
        <div></div>
      </section>
    </div>
  );
}
