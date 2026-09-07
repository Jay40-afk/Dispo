"use client";

import { useState } from "react";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ArvCompsHelper({
  onApply,
}: {
  onApply: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [comps, setComps] = useState(["", "", ""]);

  const values = comps.map(Number).filter((v) => v > 0);
  const suggested =
    values.length > 0
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 text-xs text-slate-500 underline hover:text-slate-700"
      >
        Not sure? Estimate from nearby sold homes
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium text-slate-600">
        Enter the sold price of 2–3 similar homes nearby (same size, similar
        condition, sold recently):
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {comps.map((value, i) => (
          <input
            key={i}
            type="number"
            min="0"
            step="1000"
            placeholder={`Comp ${i + 1}`}
            value={value}
            onChange={(e) =>
              setComps((prev) =>
                prev.map((v, idx) => (idx === i ? e.target.value : v)),
              )
            }
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          />
        ))}
      </div>
      {suggested !== null && (
        <div className="mt-2 flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5">
          <span className="text-xs text-slate-600">
            Average: <strong>{currency.format(suggested)}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              onApply(suggested);
              setOpen(false);
            }}
            className="text-xs font-medium text-slate-900 underline hover:text-slate-700"
          >
            Use this
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-2 text-xs text-slate-400 hover:text-slate-600"
      >
        Cancel
      </button>
    </div>
  );
}

interface RepairCategory {
  key: string;
  label: string;
  options: { label: string; value: number }[];
}

const REPAIR_CATEGORIES: RepairCategory[] = [
  {
    key: "roof",
    label: "Roof",
    options: [
      { label: "Fine", value: 0 },
      { label: "Patch", value: 1500 },
      { label: "Replace", value: 9000 },
    ],
  },
  {
    key: "hvac",
    label: "HVAC",
    options: [
      { label: "Fine", value: 0 },
      { label: "Repair", value: 1000 },
      { label: "Replace", value: 6000 },
    ],
  },
  {
    key: "kitchen",
    label: "Kitchen",
    options: [
      { label: "Fine", value: 0 },
      { label: "Refresh", value: 5000 },
      { label: "Remodel", value: 15000 },
    ],
  },
  {
    key: "bath",
    label: "Bathrooms",
    options: [
      { label: "Fine", value: 0 },
      { label: "Refresh", value: 3000 },
      { label: "Remodel", value: 8000 },
    ],
  },
  {
    key: "flooring",
    label: "Flooring",
    options: [
      { label: "Fine", value: 0 },
      { label: "Partial", value: 2000 },
      { label: "Whole house", value: 6000 },
    ],
  },
  {
    key: "paint",
    label: "Paint (in/out)",
    options: [
      { label: "Fine", value: 0 },
      { label: "Interior", value: 2500 },
      { label: "In + out", value: 5000 },
    ],
  },
  {
    key: "windows",
    label: "Windows/Doors",
    options: [
      { label: "Fine", value: 0 },
      { label: "A few", value: 1500 },
      { label: "All", value: 6000 },
    ],
  },
  {
    key: "structural",
    label: "Foundation",
    options: [
      { label: "Fine", value: 0 },
      { label: "Minor", value: 3000 },
      { label: "Major", value: 15000 },
    ],
  },
];

export function RepairChecklistHelper({
  onApply,
}: {
  onApply: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selections, setSelections] = useState<Record<string, number>>({});

  const total = Object.values(selections).reduce((a, b) => a + b, 0);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 text-xs text-slate-500 underline hover:text-slate-700"
      >
        Not sure? Walk through a repair checklist
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium text-slate-600">
        Pick the closest condition for each area:
      </p>
      <div className="mt-2 space-y-2">
        {REPAIR_CATEGORIES.map((cat) => (
          <div
            key={cat.key}
            className="flex items-center justify-between gap-2"
          >
            <span className="text-xs text-slate-600">{cat.label}</span>
            <div className="flex gap-1">
              {cat.options.map((opt) => {
                const active = selections[cat.key] === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() =>
                      setSelections((prev) => ({
                        ...prev,
                        [cat.key]: opt.value,
                      }))
                    }
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      active
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5">
        <span className="text-xs text-slate-600">
          Total: <strong>{currency.format(total)}</strong>
        </span>
        <button
          type="button"
          onClick={() => {
            onApply(total);
            setOpen(false);
          }}
          className="text-xs font-medium text-slate-900 underline hover:text-slate-700"
        >
          Use this
        </button>
      </div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-2 text-xs text-slate-400 hover:text-slate-600"
      >
        Cancel
      </button>
    </div>
  );
}
