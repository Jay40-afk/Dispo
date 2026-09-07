"use client";

import { useState } from "react";
import { createLead, deleteLead, updateLead } from "@/lib/actions/leads";
import { analyzeDeal, buildBuyerBlast, buildOfferScript } from "@/lib/deal-math";
import { ArvCompsHelper, RepairChecklistHelper } from "@/components/deal-helpers";
import { LeadPhoto } from "@/components/lead-photo";
import { PAPERWORK_CHECKLIST } from "@/lib/paperwork-checklist";
import {
  LEAD_MOTIVATION_LABELS,
  LEAD_MOTIVATIONS,
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
} from "@/types/lead";
import type { Lead, LeadStatus } from "@/types/lead";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <span
        title={hint}
        className="inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-500"
      >
        ?
      </span>
    </span>
  );
}

export function LeadModal({
  lead,
  onClose,
}: {
  lead: Lead | null;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<"script" | "blast" | null>(null);
  const [address, setAddress] = useState(lead?.address ?? "");
  const [contactName, setContactName] = useState(lead?.contact_name ?? "");
  const [status, setStatus] = useState<LeadStatus>(lead?.status ?? "new");
  const [arv, setArv] = useState(lead?.arv?.toString() ?? "");
  const [repairs, setRepairs] = useState(
    lead?.repair_estimate?.toString() ?? "",
  );
  const [fee, setFee] = useState(lead?.wholesale_fee?.toString() ?? "");

  const analysis = analyzeDeal(
    arv ? Number(arv) : null,
    repairs ? Number(repairs) : null,
    fee ? Number(fee) : null,
  );

  const script = analysis
    ? buildOfferScript(
        address,
        contactName,
        currency.format(analysis.maxOffer),
        analysis.maxOffer > 0,
      )
    : null;

  const buyerBlast =
    analysis && analysis.maxOffer > 0
      ? buildBuyerBlast(
          address,
          currency.format(analysis.contractPrice),
          currency.format(Number(arv)),
          currency.format(repairs ? Number(repairs) : 0),
        )
      : null;

  async function handleCopy(text: string, key: "script" | "blast") {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = lead
      ? await updateLead(lead.id, formData)
      : await createLead(formData);

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  async function handleDelete() {
    if (!lead) return;
    if (!confirm("Delete this lead? This can't be undone.")) return;
    setPending(true);
    await deleteLead(lead.id);
    setPending(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {lead ? "Edit Lead" : "New Lead"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Property Address *
            </label>
            <input
              name="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          {lead ? (
            <LeadPhoto leadId={lead.id} photoUrl={lead.photo_url} />
          ) : (
            <p className="text-xs text-slate-400">
              Save the lead first, then come back to add a photo.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Contact Name
              </label>
              <input
                name="contact_name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                name="phone"
                defaultValue={lead?.phone ?? ""}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Lead Source
              </label>
              <input
                name="source"
                defaultValue={lead?.source ?? ""}
                placeholder="Driving for dollars, PPC, referral…"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {PAPERWORK_CHECKLIST[status].length > 0 && (
            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                What you need at this stage
              </p>
              <ul className="mt-1.5 space-y-1">
                {PAPERWORK_CHECKLIST[status].map((item) => (
                  <li
                    key={item}
                    className="flex gap-1.5 text-xs text-blue-900"
                  >
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Motivation
              </label>
              <select
                name="motivation"
                defaultValue={lead?.motivation ?? ""}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                <option value="">Not set</option>
                {LEAD_MOTIVATIONS.map((m) => (
                  <option key={m} value={m}>
                    {LEAD_MOTIVATION_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Follow-up Date
              </label>
              <input
                type="date"
                name="follow_up_date"
                defaultValue={lead?.follow_up_date ?? ""}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              name="notes"
              defaultValue={lead?.notes ?? ""}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Deal Analyzer{" "}
              <span className="font-normal text-slate-400">(70% rule)</span>
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500">
                  <FieldLabel hint="After Repair Value — what the home would sell for once it's fully fixed up. Check recent sold prices of similar nearby homes.">
                    ARV
                  </FieldLabel>
                </label>
                <input
                  type="number"
                  name="arv"
                  min="0"
                  step="1000"
                  value={arv}
                  onChange={(e) => setArv(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500">
                  <FieldLabel hint="Your best estimate of what it'll cost to get the property market-ready — roof, HVAC, kitchen, flooring, paint, etc.">
                    Repairs
                  </FieldLabel>
                </label>
                <input
                  type="number"
                  name="repair_estimate"
                  min="0"
                  step="500"
                  value={repairs}
                  onChange={(e) => setRepairs(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500">
                  <FieldLabel hint="What you keep for finding and locking up the deal — typically $5,000–$15,000, paid by the end buyer at closing.">
                    Wholesale Fee
                  </FieldLabel>
                </label>
                <input
                  type="number"
                  name="wholesale_fee"
                  min="0"
                  step="500"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <ArvCompsHelper onApply={(value) => setArv(value.toString())} />
              <RepairChecklistHelper
                onApply={(value) => setRepairs(value.toString())}
              />
            </div>

            {!analysis && (
              <p className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-400">
                Enter the ARV above to see your recommended offer.
              </p>
            )}

            {analysis && (
              <div className="mt-4 border-t border-slate-200 pt-3">
                {analysis.maxOffer > 0 ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                      Your best offer
                    </p>
                    <p className="mt-0.5 text-2xl font-bold text-emerald-900">
                      {currency.format(analysis.maxOffer)}
                    </p>
                    <p className="mt-1 text-xs text-emerald-800">
                      Offering this much or less keeps repairs, your fee, and
                      the buyer&apos;s margin covered at 70% of ARV. Going
                      higher eats into your profit or the buyer&apos;s.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-red-700">
                      No room in this deal
                    </p>
                    <p className="mt-0.5 text-2xl font-bold text-red-900">
                      {currency.format(analysis.maxOffer)}
                    </p>
                    <p className="mt-1 text-xs text-red-800">
                      Repairs and your fee already exceed 70% of ARV. Lower
                      the offer, cut the fee, or double-check the repair
                      estimate before moving forward.
                    </p>
                  </div>
                )}

                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      <FieldLabel hint="What you charge the end buyer to take over the contract — your offer to the seller plus your wholesale fee.">
                        Contract price to buyer
                      </FieldLabel>
                    </span>
                    <span className="font-medium text-slate-700">
                      {currency.format(analysis.contractPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      <FieldLabel hint="What the buyer spends in total — contract price plus repairs. Keeping this near 70% of ARV leaves them room to profit.">
                        Buyer&apos;s all-in price
                      </FieldLabel>
                    </span>
                    <span className="font-medium text-slate-700">
                      {currency.format(analysis.buyerAllIn)}
                    </span>
                  </div>
                </div>

                {script && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Talking points for the call
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleCopy(script, "script")}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700"
                      >
                        {copiedKey === "script" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-2 rounded-lg bg-white p-3 text-sm italic text-slate-600 ring-1 ring-slate-200">
                      &ldquo;{script}&rdquo;
                    </p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      A rough guide, not a script — put it in your own words.
                    </p>
                  </div>
                )}

                {buyerBlast && (
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Message for your buyers list
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleCopy(buyerBlast, "blast")}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700"
                      >
                        {copiedKey === "blast" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-2 whitespace-pre-line rounded-lg bg-white p-3 text-sm text-slate-600 ring-1 ring-slate-200">
                      {buyerBlast}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            {lead ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Delete lead
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {pending ? "Saving…" : lead ? "Save changes" : "Create lead"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
