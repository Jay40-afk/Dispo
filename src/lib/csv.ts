import type { Lead } from "@/types/lead";
import { LEAD_STATUS_LABELS } from "@/types/lead";

const HEADERS = [
  "Address",
  "Contact Name",
  "Phone",
  "Source",
  "Status",
  "Motivation",
  "Follow-up Date",
  "ARV",
  "Repair Estimate",
  "Wholesale Fee",
  "Notes",
];

function csvCell(value: string | number | null): string {
  const str = value === null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function leadsToCsv(leads: Lead[]): string {
  const rows = leads.map((lead) =>
    [
      lead.address,
      lead.contact_name,
      lead.phone,
      lead.source,
      LEAD_STATUS_LABELS[lead.status],
      lead.motivation,
      lead.follow_up_date,
      lead.arv,
      lead.repair_estimate,
      lead.wholesale_fee,
      lead.notes,
    ]
      .map(csvCell)
      .join(","),
  );

  return [HEADERS.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
