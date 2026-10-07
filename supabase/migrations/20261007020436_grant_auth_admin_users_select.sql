-- Le Custom Access Token Hook s'exécute en tant que supabase_auth_admin, qui
-- n'a par défaut aucun accès au schéma public. La fonction du hook a besoin de
-- lire public.users pour y trouver le rôle de l'utilisateur qui se connecte.
-- RLS ne bloque pas ce grant : supabase_auth_admin n'est pas un rôle
-- "authenticated"/"anon", il contourne RLS comme les rôles internes Supabase.

grant usage on schema public to supabase_auth_admin;
grant select on public.users to supabase_auth_admin;
