export const LEAD_STATUSES = [
  "new",
  "contacted",
  "under_contract",
  "assigned",
  "closed",
  "dead",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New Lead",
  contacted: "Contacted",
  under_contract: "Under Contract",
  assigned: "Assigned to Buyer",
  closed: "Closed",
  dead: "Dead",
};

export const LEAD_MOTIVATIONS = ["hot", "warm", "cold"] as const;

export type LeadMotivation = (typeof LEAD_MOTIVATIONS)[number];

export const LEAD_MOTIVATION_LABELS: Record<LeadMotivation, string> = {
  hot: "🔥 Hot",
  warm: "🌤️ Warm",
  cold: "❄️ Cold",
};

export const LEAD_MOTIVATION_COLORS: Record<LeadMotivation, string> = {
  hot: "bg-red-100 text-red-700",
  warm: "bg-amber-100 text-amber-700",
  cold: "bg-sky-100 text-sky-700",
};

export interface Lead {
  id: string;
  user_id: string;
  address: string;
  contact_name: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  motivation: LeadMotivation | null;
  follow_up_date: string | null;
  notes: string | null;
  arv: number | null;
  repair_estimate: number | null;
  wholesale_fee: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  status_changed_at: string;
}

export type LeadInput = Omit<
  Lead,
  | "id"
  | "user_id"
  | "created_at"
  | "updated_at"
  | "status_changed_at"
  | "photo_url"
>;
