import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PLAN_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  growth: process.env.STRIPE_PRICE_GROWTH!,
} as const;

export type Plan = keyof typeof PLAN_PRICE_IDS;

export const PLAN_LEAD_LIMITS: Record<Plan, number | null> = {
  starter: 25,
  growth: null,
};
