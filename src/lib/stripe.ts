import Stripe from "stripe";

// Lazily instantiated: "Secret"-type env vars on Vercel are only injected at
// runtime, not during the build's page-data-collection step, so constructing
// this at module load time would crash the build.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

export const PLAN_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  growth: process.env.STRIPE_PRICE_GROWTH!,
} as const;

export type Plan = keyof typeof PLAN_PRICE_IDS;

export const PLAN_LEAD_LIMITS: Record<Plan, number | null> = {
  starter: 25,
  growth: null,
};
