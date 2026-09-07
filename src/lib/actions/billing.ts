"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/origin";
import { getStripe, PLAN_PRICE_IDS, type Plan } from "@/lib/stripe";
import type { Subscription } from "@/types/subscription";

export async function getSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

export async function startCheckout(plan: Plan) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const origin = await getOrigin();

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: existing?.stripe_customer_id ?? undefined,
    customer_email: existing?.stripe_customer_id ? undefined : user.email,
    client_reference_id: user.id,
    line_items: [{ price: PLAN_PRICE_IDS[plan], quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { user_id: user.id, plan },
    },
    success_url: `${origin}/dashboard/billing?success=1`,
    cancel_url: `${origin}/dashboard/billing`,
  });

  redirect(session.url!);
}

export async function openBillingPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id) redirect("/dashboard/billing");

  const origin = await getOrigin();
  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/dashboard/billing`,
  });

  redirect(portalSession.url);
}
