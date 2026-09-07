"use client";

import { useSyncExternalStore } from "react";

interface Step {
  label: string;
  done: boolean;
}

const DISMISS_KEY = "dispo-onboarding-dismissed";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return true;
}

function dismissOnboarding() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // localStorage unavailable; in-memory listeners still update this tab
  }
  listeners.forEach((notify) => notify());
}

export function OnboardingChecklist({
  hasLeads,
  hasDealNumbers,
  hasBuyers,
}: {
  hasLeads: boolean;
  hasDealNumbers: boolean;
  hasBuyers: boolean;
}) {
  const dismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const steps: Step[] = [
    { label: "Add your first lead", done: hasLeads },
    { label: "Run the numbers on a deal", done: hasDealNumbers },
    { label: "Add a buyer to your list", done: hasBuyers },
  ];
  const allDone = steps.every((s) => s.done);

  if (dismissed || allDone) return null;

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          Getting started
        </h2>
        <button
          onClick={dismissOnboarding}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Dismiss
        </button>
      </div>
      <ul className="mt-2 space-y-1.5">
        {steps.map((step) => (
          <li
            key={step.label}
            className={`flex items-center gap-2 text-sm ${
              step.done ? "text-slate-400 line-through" : "text-slate-700"
            }`}
          >
            <span>{step.done ? "✅" : "⬜"}</span>
            <span>{step.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
