-- Execute once in the Supabase SQL editor. Server-side service key only.
begin;
create table if not exists public.user_pet_states (
  device_id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.user_pet_states enable row level security;
revoke all on table public.user_pet_states from PUBLIC, anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update on table public.user_pet_states to service_role;

-- Generated artwork stays private; the application serves validated image URLs.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('pet-images','pet-images',false,20971520,array['image/png'])
on conflict (id) do nothing;
-- Existing bucket settings are deliberately not changed here. Inspect separately.
commit;
