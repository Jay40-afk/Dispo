"use client";

import { useMemo } from "react";
import type { Lead } from "@/types/lead";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function StatsBar({ leads }: { leads: Lead[] }) {
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const newThisMonth = leads.filter(
      (l) => new Date(l.created_at) >= monthStart,
    ).length;

    const closed = leads.filter((l) => l.status === "closed");
    const closedThisMonth = closed.filter(
      (l) => new Date(l.status_changed_at) >= monthStart,
    ).length;

    const totalFeesEarned = closed.reduce(
      (sum, l) => sum + (l.wholesale_fee ?? 0),
      0,
    );

    return { newThisMonth, closedThisMonth, totalFeesEarned };
  }, [leads]);

  return (
    <div className="mb-4 grid grid-cols-3 gap-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-xs text-slate-500">New leads this month</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {stats.newThisMonth}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-xs text-slate-500">Deals closed this month</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {stats.closedThisMonth}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-xs text-slate-500">Total fees earned</p>
        <p className="mt-1 text-2xl font-bold text-emerald-700">
          {currency.format(stats.totalFeesEarned)}
        </p>
      </div>
    </div>
  );
}
