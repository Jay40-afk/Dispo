import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBuyers } from "@/lib/actions/buyers";
import { BuyersList } from "@/components/buyers-list";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function BuyersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const buyers = await getBuyers();

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardHeader email={user.email ?? ""} active="buyers" />

      <div className="p-6">
        <BuyersList buyers={buyers} />
      </div>
    </main>
  );
}
