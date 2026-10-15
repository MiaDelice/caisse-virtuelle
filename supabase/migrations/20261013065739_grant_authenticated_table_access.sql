-- Oubli de la migration initiale : "Automatically expose new tables" est
-- désactivé sur ce projet (choix volontaire, voir migration init_schema), donc
-- aucune table n'a jamais reçu de GRANT SELECT/INSERT/UPDATE/DELETE pour le
-- rôle authenticated. RLS filtre les LIGNES visibles, mais sans ce GRANT de
-- base la requête échoue avant même d'atteindre RLS (erreur Postgres 42501
-- "permission denied", pas un refus RLS silencieux).
-- RLS reste la vraie barrière de sécurité par ligne ; ce GRANT ouvre juste
-- l'accès à la table au niveau rôle, cohérent avec les policies déjà en place
-- ("authenticated full access").

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.items to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_lines to authenticated;

grant usage, select on all sequences in schema public to authenticated;
