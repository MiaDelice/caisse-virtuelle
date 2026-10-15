-- Table de relation (pas de champ tableau) pour permettre des filtres futurs
-- type "quels évènements vendaient des cookies", cohérent avec le choix déjà
-- fait pour order_lines. Restreint quels items apparaissent dans la grille de
-- caisse pour un évènement donné.

create table public.event_items (
  event_id bigint not null references public.events (id) on delete cascade,
  item_id bigint not null references public.items (id) on delete cascade,
  primary key (event_id, item_id)
);

alter table public.event_items enable row level security;

create policy "authenticated full access" on public.event_items
  for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on public.event_items to authenticated;

-- Rattrapage pour l'event existant "Hors évènement" : toutes les relations
-- events créées avant cette migration n'ont aucun item associé. On associe
-- tous les items existants pour ne pas casser la caisse pour cet event.
insert into public.event_items (event_id, item_id)
select e.id, i.id
from public.events e
cross join public.items i
on conflict do nothing;
