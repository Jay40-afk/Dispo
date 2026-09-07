-- Motivation tag: how urgently the seller wants/needs to sell.
alter table public.leads
  add column if not exists motivation text check (
    motivation in ('hot', 'warm', 'cold')
  );

-- Buyers table: the wholesaler's cash-buyer list, scoped to the owning user.
create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  name text not null,
  phone text,
  email text,
  markets text,
  price_min numeric(12, 2),
  price_max numeric(12, 2),
  property_types text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists buyers_user_id_idx on public.buyers (user_id);

drop trigger if exists buyers_set_updated_at on public.buyers;
create trigger buyers_set_updated_at
  before update on public.buyers
  for each row
  execute function public.set_updated_at();

alter table public.buyers enable row level security;

drop policy if exists "Users can view their own buyers" on public.buyers;
create policy "Users can view their own buyers"
  on public.buyers for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own buyers" on public.buyers;
create policy "Users can insert their own buyers"
  on public.buyers for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own buyers" on public.buyers;
create policy "Users can update their own buyers"
  on public.buyers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own buyers" on public.buyers;
create policy "Users can delete their own buyers"
  on public.buyers for delete
  using (auth.uid() = user_id);
