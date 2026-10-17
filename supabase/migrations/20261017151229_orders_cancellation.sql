-- Annulation d'une commande (ex: validation accidentelle) sans suppression :
-- on garde la trace complète de ce qui s'est passé, l'historique reste
-- honnête. Les stats/totaux doivent exclure les commandes annulées.
-- cancelled_at nullable plutôt qu'un flag booléen : garde aussi la date
-- d'annulation, utile si besoin de justification plus tard.

alter table public.orders
  add column cancelled_at timestamptz;
