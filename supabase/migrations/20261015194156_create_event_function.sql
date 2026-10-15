-- Crée un event et ses relations event_items en une seule transaction. La
-- liste des item_ids vendables vient du multiselect de création côté front
-- (pré-rempli avec tous les items par défaut, ajustable avant validation).

create or replace function public.create_event(
  event_name text,
  event_start_at timestamptz,
  event_end_at timestamptz,
  sellable_item_ids bigint[]
)
returns public.events
language plpgsql
as $$
declare
  new_event public.events;
begin
  insert into public.events (name, start_at, end_at)
  values (event_name, event_start_at, event_end_at)
  returning * into new_event;

  insert into public.event_items (event_id, item_id)
  select new_event.id, unnest(sellable_item_ids);

  return new_event;
end;
$$;

revoke execute on function public.create_event from public;
grant execute on function public.create_event to authenticated;
