import * as React from "react";
import { DocIcon } from "@/app/_components/DocIcon";
import { CubeIcon } from "@/app/_components/CubeIcon";
import { ClockIcon } from "@/app/_components/ClockIcon";
import { ChatBubbleIcon } from "@/app/_components/ChatBubbleIcon";

type KnowledgeBaseCardProps = {
  documents: number;
  chunks: number;
  lastUpdated: string; // e.g. "2026-01-08"
  onOpenChat?: () => void;
  className?: string;
};

export const KnowledgeBaseCard = ({
  documents,
  chunks,
  lastUpdated,
  onOpenChat,
  className = "",
}: KnowledgeBaseCardProps) => {
  return (
    <div
      className={[
        "w-full max-w-sm rounded-2xl border border-app bg-card p-6 shadow-sm",
        className,
      ].join(" ")}
    >
      <h3 className="text-base font-semibold text-app">Knowledge Base</h3>

      <div className="mt-5 space-y-5">
        <StatRow icon={<DocIcon />} value={documents} label="Documents" />
        <StatRow icon={<CubeIcon />} value={chunks} label="Chunks" />
        <StatRow
          icon={<ClockIcon />}
          value={lastUpdated}
          label="Last updated"
        />
      </div>

      <button
        type="button"
        onClick={onOpenChat}
        className="mt-6 cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light active:bg-primary-light"
      >
        <ChatBubbleIcon />
        Open chat
      </button>
    </div>
  );
};

export const StatRow = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </div>

      <div className="leading-tight">
        <div className="text-2xl font-semibold text-neutral-900">{value}</div>
        <div className="mt-1 text-sm text-neutral-600">{label}</div>
      </div>
    </div>
  );
};
