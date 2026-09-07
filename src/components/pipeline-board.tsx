"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { LEAD_STATUSES } from "@/types/lead";
import type { Lead, LeadStatus } from "@/types/lead";
import { updateLeadStatus } from "@/lib/actions/leads";
import { PipelineColumn } from "@/components/pipeline-column";
import { LeadModal } from "@/components/lead-modal";
import { StatsBar } from "@/components/stats-bar";
import { downloadCsv, leadsToCsv } from "@/lib/csv";

function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } };

export function PipelineBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [syncedLeads, setSyncedLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"closed" | "new" | Lead>("closed");
  const sensors = useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(KeyboardSensor),
  );

  if (initialLeads !== syncedLeads) {
    setSyncedLeads(initialLeads);
    setLeads(initialLeads);
  }

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (lead) =>
        lead.address.toLowerCase().includes(q) ||
        lead.contact_name?.toLowerCase().includes(q) ||
        lead.source?.toLowerCase().includes(q),
    );
  }, [leads, search]);

  const leadsByStatus = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>();
    for (const status of LEAD_STATUSES) map.set(status, []);
    for (const lead of filteredLeads) map.get(lead.status)?.push(lead);
    return map;
  }, [filteredLeads]);

  const dueLeads = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return leads
      .filter(
        (lead) =>
          lead.follow_up_date &&
          lead.follow_up_date <= today &&
          lead.status !== "closed" &&
          lead.status !== "dead",
      )
      .sort((a, b) => a.follow_up_date!.localeCompare(b.follow_up_date!));
  }, [leads]);
  const today = new Date().toISOString().slice(0, 10);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as string;
    if (!isLeadStatus(newStatus)) return;

    const current = leads.find((l) => l.id === leadId);
    if (!current || current.status === newStatus) return;

    const previousStatus = current.status;
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
    );

    const result = await updateLeadStatus(leadId, newStatus);
    if (result.error) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, status: previousStatus } : l,
        ),
      );
    }
  }

  return (
    <div>
      <StatsBar leads={leads} />

      {dueLeads.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <h2 className="text-sm font-semibold text-amber-800">
            📅 Today&apos;s follow-ups ({dueLeads.length})
          </h2>
          <ul className="mt-2 space-y-1">
            {dueLeads.map((lead) => (
              <li key={lead.id}>
                <button
                  onClick={() => setModal(lead)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm hover:bg-amber-100"
                >
                  <span className="text-slate-800">
                    {lead.address}
                    {lead.contact_name && (
                      <span className="text-slate-500">
                        {" "}
                        — {lead.contact_name}
                      </span>
                    )}
                  </span>
                  <span
                    className={`shrink-0 text-xs font-medium ${
                      lead.follow_up_date! < today
                        ? "text-red-600"
                        : "text-amber-700"
                    }`}
                  >
                    {lead.follow_up_date! < today ? "Overdue" : "Today"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search by address, contact, or source…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() =>
              downloadCsv(`dispo-leads-${today}.csv`, leadsToCsv(leads))
            }
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Export CSV
          </button>
          <button
            onClick={() => setModal("new")}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Add Lead
          </button>
        </div>
      </div>

      <DndContext id="pipeline-board" sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {LEAD_STATUSES.map((status) => (
            <PipelineColumn
              key={status}
              status={status}
              leads={leadsByStatus.get(status) ?? []}
              onCardClick={(lead) => setModal(lead)}
            />
          ))}
        </div>
      </DndContext>

      {modal !== "closed" && (
        <LeadModal
          lead={modal === "new" ? null : modal}
          onClose={() => setModal("closed")}
        />
      )}
    </div>
  );
}
