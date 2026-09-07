-- Leads table: one row per wholesale deal lead, scoped to the owning user.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Contact / pipeline info
  address text not null,
  contact_name text,
  phone text,
  source text,
  status text not null default 'new' check (
    status in ('new', 'contacted', 'under_contract', 'assigned', 'closed', 'dead')
  ),
  follow_up_date date,
  notes text,

  -- Deal analysis inputs (70% rule)
  arv numeric(12, 2),
  repair_estimate numeric(12, 2),
  wholesale_fee numeric(12, 2),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_status_idx on public.leads (status);

-- Keep updated_at current on every row change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();

-- Row Level Security: each user can only see/edit their own leads.
alter table public.leads enable row level security;

drop policy if exists "Users can view their own leads" on public.leads;
create policy "Users can view their own leads"
  on public.leads for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own leads" on public.leads;
create policy "Users can insert their own leads"
  on public.leads for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own leads" on public.leads;
create policy "Users can update their own leads"
  on public.leads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own leads" on public.leads;
create policy "Users can delete their own leads"
  on public.leads for delete
  using (auth.uid() = user_id);
