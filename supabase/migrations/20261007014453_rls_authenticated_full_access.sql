-- Policies RLS minimales v1 : tout utilisateur authentifié peut tout faire.
-- Choix assumé pour la vitesse de mise en place : seules 2 personnes de confiance
-- utilisent l'app à ce stade, la distinction SELLER/MANAGER est gérée côté front
-- (guards de route + masquage UI), pas au niveau RLS.
-- À durcir si l'app s'ouvre un jour à des utilisateurs non pleinement fiables.

create policy "authenticated full access" on public.users
  for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated full access" on public.items
  for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated full access" on public.events
  for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated full access" on public.orders
  for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated full access" on public.order_lines
  for all
  to authenticated
  using (true)
  with check (true);
