create table if not exists public.user_phrase_preferences (
  device_id text primary key,
  saved_phrase_ids text[] not null default '{}',
  hidden_phrase_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create index if not exists user_phrase_preferences_updated_at_idx
  on public.user_phrase_preferences (updated_at desc);
