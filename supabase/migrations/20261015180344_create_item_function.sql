-- Crée un item en calculant automatiquement son display_index (max existant +
-- 1, place en fin de grille). Évite au client de calculer ce next index
-- lui-même, ce qui aurait un risque théorique de collision en cas de créations
-- concurrentes ; ici le calcul et l'insert sont dans la même transaction.

create or replace function public.create_item(
  item_name text,
  item_price numeric,
  item_description text
)
returns public.items
language plpgsql
as $$
declare
  new_item public.items;
  next_index integer;
begin
  select coalesce(max(display_index), 0) + 1 into next_index from public.items;

  insert into public.items (name, price, description, display_index)
  values (item_name, item_price, item_description, next_index)
  returning * into new_item;

  return new_item;
end;
$$;

revoke execute on function public.create_item from public;
grant execute on function public.create_item to authenticated;
