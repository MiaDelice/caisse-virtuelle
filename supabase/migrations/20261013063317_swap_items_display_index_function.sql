-- Permet d'échanger le display_index de deux items dans une seule transaction.
-- Nécessaire car items.display_index est UNIQUE DEFERRABLE : deux UPDATE
-- séparés depuis le client (deux requêtes HTTP = deux transactions distinctes)
-- violeraient la contrainte immédiatement, avant que le swap ne se stabilise.
-- Cette fonction exécute les deux UPDATE dans le même bloc transactionnel,
-- où la vérification d'unicité n'intervient qu'au commit.

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
  update public.items set display_index = second_index where id = first_id;
  update public.items set display_index = first_index where id = second_id;
end;
$$;

revoke execute on function public.swap_items_display_index from public;
grant execute on function public.swap_items_display_index to authenticated;
