-- Remplace public.users.name (un seul champ "Prénom NOM") par first_name/last_name
-- séparés. Évite le parsing fragile d'un nom complet pour en déduire des
-- initiales ou gérer des noms composés (ex: "Anne-Marie LEFEVRE").
-- Aucune ligne réelle en prod à ce stade, seul le compte de test existe :
-- valeurs renseignées en dur pour satisfaire temporairement le NOT NULL.

alter table public.users
  add column first_name text,
  add column last_name text;

update public.users set first_name = 'Test', last_name = 'Manager' where first_name is null;

alter table public.users
  drop column name,
  alter column first_name set not null,
  alter column last_name set not null;
