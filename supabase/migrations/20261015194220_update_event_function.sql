-- Met à jour le nom d'un event et remplace entièrement l'ensemble de ses
-- items vendables (delete + insert plutôt qu'un diff, plus simple et
-- suffisant vu le volume). En transaction pour éviter un état intermédiaire
-- incohérent si l'insert échoue après le delete.

create or replace function public.update_event(
  target_event_id bigint,
  event_name text,
  sellable_item_ids bigint[]
)
returns void
language plpgsql
as $$
begin
  update public.events set name = event_name where id = target_event_id;

  delete from public.event_items where event_id = target_event_id;

  insert into public.event_items (event_id, item_id)
  select target_event_id, unnest(sellable_item_ids);
end;
$$;

revoke execute on function public.update_event from public;
grant execute on function public.update_event to authenticated;
