-- Flag d'affichage/filtrage côté app : la vraie barrière de sécurité est le
-- ban Supabase Auth (géré côté serveur, server/api/users/[id]/toggle-active.ts),
-- ce flag sert uniquement à ce que le backoffice sache afficher l'état sans
-- avoir à interroger l'API Auth à chaque fois.

alter table public.users
  add column is_active boolean not null default true;
