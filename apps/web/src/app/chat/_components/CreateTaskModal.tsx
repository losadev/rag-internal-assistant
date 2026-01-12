"use client";
import { useState } from "react";
import { Source } from "@/lib/types";
import { ChecklistIcon } from "./ChecklistIcon";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
  userMessage: string;
  assistantMessage: string;
  conversationId: string;
  messageId?: string;
}

type Status = "idle" | "loading" | "success" | "error";

export const CreateTaskModal = ({
  isOpen,
  onClose,
  sources,
  userMessage,
  assistantMessage,
  conversationId,
  messageId,
}: CreateTaskModalProps) => {
  const [status, setStatus] = useState<Status>("idle");
  const [title, setTitle] = useState(
    `Seguimiento: ${userMessage.substring(0, 100)}`
  );
  const [description, setDescription] = useState(
    `Contexto: ${userMessage}\n\nRespuesta: ${assistantMessage.substring(
      0,
      150
    )}...\n\nFuentes:\n${sources
      .map((s) => `- ${s.document}${s.page ? ` (p. ${s.page})` : ""}`)
      .join("\n")}`
  );
  const [priority, setPriority] = useState("Medium");
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskUrl, setTaskUrl] = useState<string | null>(null);

  const titleLength = title.length;
  const descriptionLength = description.length;
  const isCreateDisabled =
    title.length < 3 || description.length < 5 || status === "loading";

  const handleCreateTask = async () => {
    if (isCreateDisabled) return;

    // Verificar si hay sources
    if (sources.length === 0) {
      const confirmed = window.confirm(
        "No hay fuentes. ¿Estás seguro de que deseas crear una tarea sin evidencia?"
      );
      if (!confirmed) return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          context: {
            conversationId,
            messageId: messageId || `msg_${Date.now()}`,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear la tarea");
      }

      setStatus("success");
      setTaskId(data.taskId);
      setTaskUrl(data.url);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Error desconocido");
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setError(null);
  };

  const handleClose = () => {
    setStatus("idle");
    setTitle(`Seguimiento: ${userMessage.substring(0, 100)}`);
    setDescription(
      `Contexto: ${userMessage}\n\nRespuesta: ${assistantMessage.substring(
        0,
        150
      )}...\n\nFuentes:\n${sources
        .map((s) => `- ${s.document}${s.page ? ` (p. ${s.page})` : ""}`)
        .join("\n")}`
    );
    setPriority("Medium");
    setError(null);
    setTaskId(null);
    setTaskUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-start gap-4">
          <div className="text-green-500 text-2xl">
            <ChecklistIcon />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Crear tarea</h2>
            <p className="text-gray-600 text-sm mt-1">
              Convierte esta respuesta en una tarea en Google Sheets
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Messages */}
          {status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">✅ Tarea creada</p>
              {taskId && (
                <p className="text-sm text-green-700 mt-2">ID: {taskId}</p>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">
                ❌ No se pudo crear la tarea
              </p>
              <p className="text-sm text-red-700 mt-2">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          {status !== "success" && (
            <>
              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.substring(0, 120))}
                  disabled={status === "loading"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Ej: Seguimiento: Análisis de datos"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {titleLength} / 120 caracteres
                </p>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value.substring(0, 2000))
                  }
                  disabled={status === "loading"}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Incluye contexto, respuesta y referencias..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {descriptionLength} / 2000 caracteres
                </p>
              </div>

              {/* Priority Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <div className="flex gap-3">
                  {["Low", "Medium", "High"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      disabled={status === "loading"}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        priority === p
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Sources Section */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Fuentes
            </h3>
            {sources.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ No hay fuentes. No se recomienda crear una tarea sin
                  evidencia.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sources.slice(0, 3).map((source, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {source.document}
                      {source.page && (
                        <span className="text-gray-600">
                          {" "}
                          (p. {source.page})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {source.snippet.substring(0, 140)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end bg-gray-50">
          {status === "success" ? (
            <>
              {taskUrl && (
                <a
                  href={taskUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
                >
                  Abrir en Google Sheets
                </a>
              )}
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium transition-colors"
              >
                Cerrar
              </button>
            </>
          ) : status === "error" ? (
            <>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium transition-colors"
              >
                Cerrar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleClose}
                disabled={status === "loading"}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTask}
                disabled={isCreateDisabled}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <span
                      className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-label="Cargando"
                    />
                    Creando…
                  </>
                ) : (
                  "Crear tarea"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
