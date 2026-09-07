"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Lead, LeadStatus } from "@/types/lead";
import { LEAD_STATUS_LABELS } from "@/types/lead";
import { LeadCard } from "@/components/lead-card";

export function PipelineColumn({
  status,
  leads,
  onCardClick,
}: {
  status: LeadStatus;
  leads: Lead[];
  onCardClick: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-xl border p-2 transition-colors ${
        isOver ? "border-slate-400 bg-slate-100" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-slate-700">
          {LEAD_STATUS_LABELS[status]}
        </h2>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
          {leads.length}
        </span>
      </div>
      <div className="flex min-h-[4rem] flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
        ))}
      </div>
    </div>
  );
}
