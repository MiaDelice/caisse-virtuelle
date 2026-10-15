-- Ajoute la gestion d'un event "actif" (destination des nouvelles ventes) et
-- d'un event "par défaut" (celui qu'on ne peut jamais désactiver sans en
-- activer un autre à la place — remplace l'event "Hors évènement" id=1 codé
-- en dur ailleurs dans le code).
--
-- Contraintes d'unicité partielles : au plus un event actif, au plus un event
-- par défaut, garanties au niveau DB pour ne pas dépendre uniquement du front.

alter table public.events
  add column active boolean not null default false,
  add column is_default boolean not null default false;

create unique index events_single_active_idx on public.events (active) where active = true;
create unique index events_single_default_idx on public.events (is_default) where is_default = true;

-- L'event existant "Hors évènement" (id=1, créé manuellement via dashboard)
-- devient l'event par défaut et actif initial.
update public.events set is_default = true, active = true where id = 1;
