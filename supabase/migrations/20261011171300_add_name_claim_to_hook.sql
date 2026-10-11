-- Ajoute le prénom/nom (public.users.first_name / last_name) comme claims
-- custom dans le JWT, au même titre que user_role, pour affichage front
-- (initiales, menu utilisateur) sans appel réseau supplémentaire après le login.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  user_record record;
begin
  select role, first_name, last_name
  into user_record
  from public.users
  where auth_user_id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';

  if user_record.role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_record.role));
  end if;

  if user_record.first_name is not null then
    claims := jsonb_set(claims, '{user_first_name}', to_jsonb(user_record.first_name));
  end if;

  if user_record.last_name is not null then
    claims := jsonb_set(claims, '{user_last_name}', to_jsonb(user_record.last_name));
  end if;

  return jsonb_build_object('claims', claims);
end;
$$;
