-- Corrige swap_items_display_index : la contrainte items_display_index_unique
-- est DEFERRABLE mais INITIALLY IMMEDIATE, donc par défaut elle est toujours
-- vérifiée après chaque UPDATE, pas seulement au commit (DEFERRABLE seul ne
-- diffère rien automatiquement). Il faut explicitement différer la vérification
-- pour la durée de cette transaction via SET CONSTRAINTS ... DEFERRED.

create or replace function public.swap_items_display_index(
  first_id bigint,
  first_index integer,
  second_id bigint,
  second_index integer
)
returns void
language plpgsql
as $$
begin
  set constraints public.items_display_index_unique deferred;

  update public.items set display_index = second_index where id = first_id;
  update public.items set display_index = first_index where id = second_id;
end;
$$;
