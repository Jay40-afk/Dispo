"use client";

import { useState } from "react";
import { createBuyer, deleteBuyer, updateBuyer } from "@/lib/actions/buyers";
import type { Buyer } from "@/types/buyer";

export function BuyerModal({
  buyer,
  onClose,
}: {
  buyer: Buyer | null;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = buyer
      ? await updateBuyer(buyer.id, formData)
      : await createBuyer(formData);

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  async function handleDelete() {
    if (!buyer) return;
    if (!confirm("Delete this buyer? This can't be undone.")) return;
    setPending(true);
    await deleteBuyer(buyer.id);
    setPending(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {buyer ? "Edit Buyer" : "New Buyer"}
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
              Name *
            </label>
            <input
              name="name"
              required
              defaultValue={buyer?.name ?? ""}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                name="phone"
                defaultValue={buyer?.phone ?? ""}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={buyer?.email ?? ""}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Markets
            </label>
            <input
              name="markets"
              defaultValue={buyer?.markets ?? ""}
              placeholder="Tampa, Orlando, Hillsborough County…"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Min Price
              </label>
              <input
                type="number"
                name="price_min"
                min="0"
                step="1000"
                defaultValue={buyer?.price_min ?? ""}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Max Price
              </label>
              <input
                type="number"
                name="price_max"
                min="0"
                step="1000"
                defaultValue={buyer?.price_max ?? ""}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Property Types
            </label>
            <input
              name="property_types"
              defaultValue={buyer?.property_types ?? ""}
              placeholder="Single family, duplex, fixer-uppers…"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              name="notes"
              defaultValue={buyer?.notes ?? ""}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            {buyer ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Delete buyer
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
                {pending ? "Saving…" : buyer ? "Save changes" : "Create buyer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
