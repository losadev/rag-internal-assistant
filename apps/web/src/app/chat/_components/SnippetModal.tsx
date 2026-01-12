"use client";

interface SnippetModalProps {
  title: string;
  snippet: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SnippetModal = ({
  title,
  snippet,
  isOpen,
  onClose,
}: SnippetModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 bg-opacity-20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-app rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-app">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-app transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
          {snippet}
        </p>
      </div>
    </div>
  );
};
