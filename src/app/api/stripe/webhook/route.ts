import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, PLAN_PRICE_IDS } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionStatus } from "@/types/subscription";

function normalizeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "paused":
      return "past_due";
    case "incomplete":
      return "incomplete";
    case "canceled":
    case "incomplete_expired":
    case "unpaid":
      return "canceled";
    default:
      return "past_due";
  }
}

function planFromPriceId(priceId: string | undefined): "starter" | "growth" | null {
  const match = (Object.entries(PLAN_PRICE_IDS) as [
    "starter" | "growth",
    string,
  ][]).find(([, id]) => id === priceId);
  return match?.[0] ?? null;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.user_id;

    if (userId) {
      const item = subscription.items.data[0];
      const supabase = createAdminClient();

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        plan: planFromPriceId(item?.price.id),
        status: normalizeStatus(subscription.status),
        current_period_end: item
          ? new Date(item.current_period_end * 1000).toISOString()
          : null,
      });
    }
  }

  return NextResponse.json({ received: true });
}
