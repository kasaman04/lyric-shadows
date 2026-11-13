-- MANUAL ONLY. Audit first and confirm the server AND PC worker use a
-- server-only key for the intended project. This does not authenticate app users.
-- Missing tables are skipped (e.g. pet storage may use disk).
-- This script changes access settings only; it does not rewrite user data.
begin;
set local lock_timeout = '5s';

do $$
declare
  target_name text;
  target_oid regclass;
  column_name text;
begin
  foreach target_name in array array['user_phrase_preferences', 'user_pet_states']
  loop
    target_oid := to_regclass(format('public.%I', target_name));
    if target_oid is null then
      raise notice 'Skipping missing table public.%', target_name;
      continue;
    end if;
    execute format('alter table %s enable row level security', target_oid);
    execute format('revoke all privileges on table %s from PUBLIC, anon, authenticated', target_oid);
    -- Table-level REVOKE does not remove independent column grants.
    for column_name in
      select attname from pg_attribute
      where attrelid = target_oid and attnum > 0 and not attisdropped
    loop
      execute format('revoke all privileges (%I) on table %s from PUBLIC, anon, authenticated', column_name, target_oid);
    end loop;
    execute format('grant select, insert, update on table %s to service_role', target_oid);
  end loop;
end
$$;

grant usage on schema public to service_role;
commit;
