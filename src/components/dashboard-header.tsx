import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

export function DashboardHeader({
  email,
  active,
}: {
  email: string;
  active: "pipeline" | "buyers" | "billing";
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center gap-4 sm:gap-6">
        <h1 className="text-lg font-semibold text-slate-900">Dispo</h1>
        <nav className="flex gap-4 text-sm font-medium">
          <Link
            href="/dashboard"
            className={
              active === "pipeline"
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-900"
            }
          >
            Pipeline
          </Link>
          <Link
            href="/dashboard/buyers"
            className={
              active === "buyers"
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-900"
            }
          >
            Buyers
          </Link>
          <Link
            href="/dashboard/billing"
            className={
              active === "billing"
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-900"
            }
          >
            Billing
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden truncate text-sm text-slate-500 sm:inline">
          {email}
        </span>
        <form action={signOut}>
          <button
            type="submit"
            className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
