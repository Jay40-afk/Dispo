-- 0004's backfill was a no-op: ADD COLUMN ... DEFAULT NOW() already populates
-- existing rows with the ALTER's timestamp, so status_changed_at IS NULL never
-- matched anything. Reset it to created_at as originally intended.
update public.leads set status_changed_at = created_at;
