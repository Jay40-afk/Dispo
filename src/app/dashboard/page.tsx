import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeads } from "@/lib/actions/leads";
import { getTasks } from "@/lib/actions/tasks";
import { getBuyers } from "@/lib/actions/buyers";
import { PipelineBoard } from "@/components/pipeline-board";
import { TodoList } from "@/components/todo-list";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const leads = await getLeads();
  const tasks = await getTasks();
  const buyers = await getBuyers();

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardHeader email={user.email ?? ""} active="pipeline" />

      <div className="p-6">
        <OnboardingChecklist
          hasLeads={leads.length > 0}
          hasDealNumbers={leads.some((l) => l.arv !== null)}
          hasBuyers={buyers.length > 0}
        />
        <div className="mb-4">
          <TodoList initialTasks={tasks} />
        </div>
        <PipelineBoard initialLeads={leads} />
      </div>
    </main>
  );
}
