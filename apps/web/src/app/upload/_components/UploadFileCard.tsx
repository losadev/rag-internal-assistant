import { UploadIcon } from "@/app/_components/UploadIcon";

export const UploadFileCard = () => {
  return (
    <div className="rounded-lg border border-gray-300 bg-white p-8 flex flex-col items-center justify-center cursor-pointer border-dashed gap-6">
      <span className="bg-gray-200 p-4 rounded-full inline-block mb-2 text-center">
        <UploadIcon className="text-gray-600" />
      </span>
      <div className="text-center">
        <p className="text-black text-xl font-medium">Drag & drop files here</p>
        <p className="text-gray-500">
          Supports PDF, Markdown, and TXT files (max 10MB per file)
        </p>
      </div>
      <div>
        <button
          type="button"
          className="mt-4 text-gray-600 border border-gray-300 font-medium p-2 rounded hover:bg-blue-500 hover:text-white cursor-pointer text-center"
        >
          Browse Files
        </button>
      </div>
    </div>
  );
};
