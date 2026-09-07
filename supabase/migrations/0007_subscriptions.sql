-- One row per user tracking their Stripe subscription state. Absence of a
-- row (or status outside 'trialing'/'active') means no active plan.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,

  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text check (plan in ('starter', 'growth')),
  status text not null default 'none' check (
    status in ('none', 'trialing', 'active', 'past_due', 'canceled', 'incomplete')
  ),
  current_period_end timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

-- Users can read their own subscription row. All writes happen via the
-- server (service role, from the Stripe webhook), never directly from
-- the client, so there are no insert/update/delete policies here.
drop policy if exists "Users can view their own subscription" on public.subscriptions;
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
