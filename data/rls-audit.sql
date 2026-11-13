-- Read-only metadata audit. Run against project ocygxcbqrnfpyxtvpvcm.
begin read only;
select n.nspname as schema_name, c.relname as table_name,
       c.relrowsecurity as rls_enabled, r.role_name,
       has_schema_privilege(r.role_name, n.oid, 'USAGE') as schema_usage,
       has_table_privilege(r.role_name, c.oid, 'SELECT') as can_select,
       has_table_privilege(r.role_name, c.oid, 'INSERT') as can_insert,
       has_table_privilege(r.role_name, c.oid, 'UPDATE') as can_update,
       has_table_privilege(r.role_name, c.oid, 'DELETE') as can_delete,
       has_table_privilege(r.role_name, c.oid, 'TRUNCATE') as can_truncate,
       has_any_column_privilege(r.role_name, c.oid, 'SELECT') as any_column_select,
       has_any_column_privilege(r.role_name, c.oid, 'INSERT') as any_column_insert,
       has_any_column_privilege(r.role_name, c.oid, 'UPDATE') as any_column_update
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
cross join (values ('anon'), ('authenticated'), ('service_role')) r(role_name)
where n.nspname = 'public' and c.relkind in ('r', 'p')
order by c.relname, r.role_name;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('user_phrase_preferences', 'user_pet_states')
order by table_name, ordinal_position;

select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('pet-images', 'voice-practice');
commit;
