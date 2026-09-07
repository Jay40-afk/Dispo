import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubscription, openBillingPortal, startCheckout } from "@/lib/actions/billing";
import { DashboardHeader } from "@/components/dashboard-header";

const PLAN_LABELS = { starter: "Starter", growth: "Growth" } as const;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { success } = await searchParams;
  const subscription = await getSubscription();
  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardHeader email={user.email ?? ""} active="billing" />

      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-xl font-semibold text-slate-900">Billing</h1>

        {success && (
          <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            You&apos;re all set! Your subscription is active.
          </p>
        )}

        {isActive && subscription ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Current plan</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {subscription.plan ? PLAN_LABELS[subscription.plan] : "—"}
              {subscription.status === "trialing" && (
                <span className="ml-2 text-sm font-normal text-amber-600">
                  (free trial)
                </span>
              )}
            </p>
            {subscription.current_period_end && (
              <p className="mt-1 text-sm text-slate-500">
                Renews{" "}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
            <form action={openBillingPortal} className="mt-4">
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Manage billing
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-slate-900">Starter</h2>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                $9<span className="text-sm font-normal text-slate-500">/mo</span>
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                <li>Full pipeline &amp; deal analyzer</li>
                <li>Up to 25 active leads</li>
              </ul>
              <form action={startCheckout.bind(null, "starter")} className="mt-4">
                <button
                  type="submit"
                  className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Start 7-day free trial
                </button>
              </form>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-slate-900">Growth</h2>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                $19<span className="text-sm font-normal text-slate-500">/mo</span>
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                <li>Unlimited leads</li>
                <li>Buyers list</li>
                <li>CSV export</li>
                <li>Property photos</li>
              </ul>
              <form action={startCheckout.bind(null, "growth")} className="mt-4">
                <button
                  type="submit"
                  className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Start 7-day free trial
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
