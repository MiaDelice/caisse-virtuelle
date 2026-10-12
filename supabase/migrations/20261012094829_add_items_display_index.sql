-- Ajoute un index d'affichage pour permettre d'ordonner visuellement les
-- cases produits dans la vue caisse, indépendamment de l'id technique (qui
-- reste la clé référencée par order_lines, jamais réordonné).
-- Contrainte UNIQUE DEFERRABLE : permet de swapper l'index de deux items dans
-- une seule transaction (ex: UPDATE ... WHERE id IN (a, b)) sans passer par
-- une valeur intermédiaire temporaire — l'unicité n'est vérifiée qu'au commit.

alter table public.items
  add column display_index integer;

-- Valeurs initiales basées sur l'ordre d'insertion (id croissant), à
-- réordonner ensuite depuis le backoffice.
with ordered as (
  select id, row_number() over (order by id) as rn
  from public.items
)
update public.items
set display_index = ordered.rn
from ordered
where public.items.id = ordered.id;

alter table public.items
  alter column display_index set not null,
  add constraint items_display_index_unique unique (display_index) deferrable initially immediate;
