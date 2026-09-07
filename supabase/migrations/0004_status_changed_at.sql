-- Tracks when a lead last moved to a new pipeline stage, so the UI can show
-- "days in this stage" and flag leads that have gone cold.
alter table public.leads
  add column if not exists status_changed_at timestamptz not null default now();

-- Backfill existing rows so old leads don't all show as "just moved".
update public.leads set status_changed_at = created_at
  where status_changed_at is null;

create or replace function public.set_status_changed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists leads_set_status_changed_at on public.leads;
create trigger leads_set_status_changed_at
  before update on public.leads
  for each row
  execute function public.set_status_changed_at();
