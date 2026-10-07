-- Corrige le format de retour du hook. Supabase Auth attend uniquement
-- jsonb_build_object('claims', new_claims) en sortie, pas l'event entier
-- modifié. La version précédente retournait `event` complet : le hook
-- s'exécutait sans erreur (visible dans les Auth Logs : "Hook ran
-- successfully") mais le claim custom n'apparaissait jamais dans le JWT final,
-- car Supabase ne reconnaît pas ce format de sortie.
-- Référence : https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook

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
