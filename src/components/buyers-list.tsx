"use client";

import { useState } from "react";
import { BuyerModal } from "@/components/buyer-modal";
import type { Buyer } from "@/types/buyer";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function priceRange(buyer: Buyer): string | null {
  if (buyer.price_min && buyer.price_max) {
    return `${currency.format(buyer.price_min)} – ${currency.format(buyer.price_max)}`;
  }
  if (buyer.price_max) return `Up to ${currency.format(buyer.price_max)}`;
  if (buyer.price_min) return `${currency.format(buyer.price_min)}+`;
  return null;
}

export function BuyersList({ buyers }: { buyers: Buyer[] }) {
  const [modal, setModal] = useState<"closed" | "new" | Buyer>("closed");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Buyers ({buyers.length})
        </h2>
        <button
          onClick={() => setModal("new")}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Add Buyer
        </button>
      </div>

      {buyers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No buyers yet. Add the cash buyers you know so you have somewhere
          to send deals once you lock one up.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {buyers.map((buyer) => (
            <button
              key={buyer.id}
              onClick={() => setModal(buyer)}
              className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-slate-300 hover:shadow"
            >
              <p className="font-medium text-slate-900">{buyer.name}</p>
              {buyer.phone && (
                <p className="mt-1 text-sm text-slate-600">{buyer.phone}</p>
              )}
              {buyer.markets && (
                <p className="mt-1 text-xs text-slate-500">{buyer.markets}</p>
              )}
              {priceRange(buyer) && (
                <p className="mt-2 text-xs font-medium text-slate-700">
                  {priceRange(buyer)}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {modal !== "closed" && (
        <BuyerModal
          buyer={modal === "new" ? null : modal}
          onClose={() => setModal("closed")}
        />
      )}
    </div>
  );
}
