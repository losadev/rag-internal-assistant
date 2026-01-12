"use client";

import { useState } from "react";
import { UploadIcon } from "@/app/_components/UploadIcon";

export const UploadFileCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    const file = files[0];
    const allowedTypes = ["application/pdf", "text/plain", "text/markdown"];

    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Solo se permiten PDF, TXT y Markdown",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "El archivo no debe exceder 10MB" });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `${file.name} cargado exitosamente`,
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Error al cargar archivo",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al conectar con el servidor" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowse = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.txt,.md";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) handleFileUpload(files);
    };
    input.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files) handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="rounded-lg border border-app bg-card p-8 flex flex-col items-center justify-center cursor-pointer border-dashed gap-6"
    >
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
          onClick={handleBrowse}
          disabled={isLoading}
          type="button"
          className="mt-4 text-app border border-app font-medium p-2 rounded hover:bg-primary hover:text-white cursor-pointer text-center disabled:opacity-50"
        >
          {isLoading ? "Cargando..." : "Browse Files"}
        </button>
      </div>
      {message && (
        <div
          className={`text-sm font-medium ${
            message.type === "success" ? "text-green-500" : "text-red-500"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};
