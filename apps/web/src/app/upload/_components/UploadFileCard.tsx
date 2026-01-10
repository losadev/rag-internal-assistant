import { UploadIcon } from "@/app/_components/UploadIcon";

export const UploadFileCard = () => {
  return (
    <div className="rounded-lg border border-app bg-card p-8 flex flex-col items-center justify-center cursor-pointer border-dashed gap-6">
      <span className="bg-muted p-4 rounded-full inline-block mb-2 text-center">
        <UploadIcon className="text-primary" />
      </span>
      <div className="text-center">
        <p className="text-app text-xl font-medium">Drag & drop files here</p>
        <p className="text-muted">
          Supports PDF, Markdown, and TXT files (max 10MB per file)
        </p>
      </div>
      <div>
        <button
          type="button"
          className="mt-4 text-app border border-app font-medium p-2 rounded hover:bg-primary hover:text-white cursor-pointer text-center"
        >
          Browse Files
        </button>
      </div>
    </div>
  );
};
