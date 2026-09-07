"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { LEAD_MOTIVATION_COLORS, LEAD_MOTIVATION_LABELS } from "@/types/lead";
import type { Lead } from "@/types/lead";
import { daysSince } from "@/lib/dates";

function staleness(days: number): string {
  if (days >= 14) return "text-red-500";
  if (days >= 7) return "text-amber-500";
  return "text-slate-400";
}

export function LeadCard({
  lead,
  onClick,
}: {
  lead: Lead;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const daysInStage = daysSince(lead.status_changed_at);
  const showStaleness = lead.status !== "closed" && lead.status !== "dead";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300 hover:shadow ${
        isDragging ? "z-10 opacity-50" : ""
      }`}
    >
      <div className="flex gap-2">
        {lead.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lead.photo_url}
            alt=""
            className="h-12 w-12 shrink-0 rounded-md object-cover ring-1 ring-slate-200"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">
              {lead.address}
            </p>
            {lead.motivation && (
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap ${LEAD_MOTIVATION_COLORS[lead.motivation]}`}
              >
                {LEAD_MOTIVATION_LABELS[lead.motivation]}
              </span>
            )}
          </div>
          {lead.contact_name && (
            <p className="mt-1 text-xs text-slate-600">{lead.contact_name}</p>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{lead.source ?? "—"}</span>
        {lead.follow_up_date && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-500">
            {new Date(lead.follow_up_date + "T00:00:00").toLocaleDateString(
              undefined,
              { month: "short", day: "numeric" },
            )}
          </span>
        )}
      </div>
      {showStaleness && (
        <p className={`mt-1 text-[11px] ${staleness(daysInStage)}`}>
          {daysInStage === 0
            ? "Moved here today"
            : `${daysInStage} day${daysInStage === 1 ? "" : "s"} in this stage`}
        </p>
      )}
    </div>
  );
}
