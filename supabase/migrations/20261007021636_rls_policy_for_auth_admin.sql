-- Correction : supabase_auth_admin n'a PAS rolbypassrls (vérifié empiriquement
-- via pg_roles), contrairement à ce qu'affirmait le commentaire de la migration
-- 20261007020436. Le GRANT SELECT seul ne suffit donc pas : sans policy RLS
-- couvrant ce rôle, la table reste illisible pour lui (RLS bloque
-- silencieusement, pas d'erreur), ce qui faisait échouer le hook sans jamais
-- lever d'exception visible dans les Auth Logs.

create policy "auth admin can read users for jwt claims" on public.users
  for select
  to supabase_auth_admin
  using (true);
