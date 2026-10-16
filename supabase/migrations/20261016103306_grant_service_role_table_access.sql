-- Oubli de même nature que grant_authenticated_table_access (voir cette
-- migration) et grant_auth_admin_users_select : service_role bypass RLS
-- (rolbypassrls = true, vérifié) mais ça ne donne pas automatiquement les
-- GRANTs CRUD de base — distinct de RLS, nécessaire même pour un rôle qui
-- bypass RLS. Découvert via server/api/users/index.post.ts qui échouait avec
-- "permission denied for table users" malgré l'usage de service_role.

grant usage on schema public to service_role;

grant select, insert, update, delete on public.users to service_role;
grant select, insert, update, delete on public.items to service_role;
grant select, insert, update, delete on public.events to service_role;
grant select, insert, update, delete on public.orders to service_role;
grant select, insert, update, delete on public.order_lines to service_role;
grant select, insert, update, delete on public.event_items to service_role;

grant usage, select on all sequences in schema public to service_role;
