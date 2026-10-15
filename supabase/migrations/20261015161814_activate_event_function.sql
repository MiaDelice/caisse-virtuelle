-- Active un event et désactive l'ancien actif dans la même transaction.
-- Nécessaire à cause de la contrainte d'unicité partielle sur active=true :
-- deux UPDATE séparés depuis le client violeraient la contrainte avant que le
-- switch ne se stabilise (même raison que swap_items_display_index).
-- Empêche explicitement de désactiver l'event par défaut sans activer un
-- autre event à la place (on ne peut pas appeler cette fonction avec
-- l'id de l'event par défaut si ce n'est pas lui qu'on veut activer — en
-- pratique le front n'autorise de toute façon pas de cliquer sur
-- "désactiver" l'event par défaut, voir activate_event ci-dessous qui
-- sert uniquement à activer, jamais à désactiver sans remplaçant).

create or replace function public.activate_event(target_event_id bigint)
returns void
language plpgsql
as $$
begin
  update public.events set active = false where active = true and id <> target_event_id;
  update public.events set active = true where id = target_event_id;
end;
$$;

revoke execute on function public.activate_event from public;
grant execute on function public.activate_event to authenticated;
