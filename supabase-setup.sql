-- Run manually after configuring the server-only key; see docs/supabase-security.md.
begin;
create table if not exists public.user_phrase_preferences (
  device_id text primary key,
  saved_phrase_ids text[] not null default '{}',
  hidden_phrase_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create index if not exists user_phrase_preferences_updated_at_idx
  on public.user_phrase_preferences (updated_at desc);

alter table public.user_phrase_preferences enable row level security;
revoke all on table public.user_phrase_preferences from PUBLIC, anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update on table public.user_phrase_preferences to service_role;
commit;
