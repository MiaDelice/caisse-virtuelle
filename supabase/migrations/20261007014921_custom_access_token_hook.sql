-- Custom Access Token Hook : injecte le rôle métier (public.users.role) comme
-- claim custom "user_role" dans le JWT à chaque émission/refresh de session.
-- La table public.users reste la seule source de vérité pour le rôle ; ce hook
-- ne fait que la lire et la recopier dans le token au moment du login.
--
-- Après avoir poussé cette migration, il faut encore activer le hook dans la
-- config Auth du dashboard (Authentication > Hooks), il n'est pas branché
-- automatiquement par la simple création de la fonction.

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

  event := jsonb_set(event, '{claims}', claims);

  return event;
end;
$$;

-- Seul le rôle interne utilisé par Supabase Auth pour exécuter les hooks peut
-- appeler cette fonction : ni anon, ni authenticated, ni public.
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
