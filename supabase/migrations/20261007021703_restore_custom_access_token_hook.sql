-- Remet la logique définitive du hook (le debug_marker temporaire utilisé
-- pour isoler le bug RLS/auth_admin n'était que pour le diagnostic en local,
-- jamais poussé comme migration).

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  user_role text;
begin
  select role
  into user_role
  from public.users
  where auth_user_id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';

  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  end if;

  return jsonb_build_object('claims', claims);
end;
$$;
