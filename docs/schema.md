# Schéma de données (v1)

Statut : figé pour la v1. Toute évolution doit être documentée ici.

## Vue d'ensemble

- `users` : vendeurs et gérants, avec rôle.
- `items` : produits vendables, avec prix courant.
- `events` : événements de vente (braderie, salon...), potentiellement sur plusieurs jours.
- `orders` : commandes, rattachées à un event et à un user, générées côté client (offline-first).
- `order_lines` : lignes de commande (item + quantité + prix figé au moment de la vente).

## Tables

### `users`

| Colonne       | Type                        | Notes                                      |
|---------------|-----------------------------|---------------------------------------------|
| id            | int, autoincrement, PK      |                                             |
| name          | string                      |                                             |
| role          | enum `SELLER` \| `MANAGER`  |                                             |
| auth_user_id  | FK → Supabase Auth user     | à détailler lors de l'intégration auth      |

### `items`

| Colonne      | Type                   | Notes                     |
|--------------|------------------------|----------------------------|
| id           | int, autoincrement, PK |                            |
| name         | string                 |                            |
| price        | float                  | prix courant de l'item     |
| description  | string, optionnel      |                            |

### `events`

| Colonne   | Type                   | Notes                                           |
|-----------|-------------------------|--------------------------------------------------|
| id        | int, autoincrement, PK |                                                   |
| name      | string                 |                                                   |
| start_at  | timestamptz            |                                                   |
| end_at    | timestamptz, optionnel | un event peut durer plusieurs jours (ex: weekend) |

### `orders`

| Colonne     | Type                   | Notes                                                              |
|-------------|------------------------|---------------------------------------------------------------------|
| id          | uuid, PK               | généré côté client (`crypto.randomUUID()`) pour idempotence offline |
| event_id    | FK → events.id         | une commande appartient à un seul événement                        |
| user_id     | FK → users.id          | vendeur ayant encaissé                                              |
| created_at  | timestamptz            |                                                                       |

Pas de colonne `total` stockée : dérivée de `order_lines` (`SUM(quantity * price)`), calculée à la demande côté serveur ou mise en cache côté store front uniquement.

### `order_lines`

| Colonne    | Type           | Notes                                                        |
|------------|----------------|----------------------------------------------------------------|
| order_id   | FK → orders.id | PK composite avec item_id                                      |
| item_id    | FK → items.id  | PK composite avec order_id                                     |
| quantity   | int            |                                                                  |
| price      | float          | prix figé au moment de la vente (historique, indépendant du prix courant de `items`) |

## Décisions actées

- **UUID côté client pour `orders.id`** : évite les conflits entre devices qui créent des commandes hors ligne, permet un sync idempotent côté serveur (upsert par id, pas de doublon possible).
- **Pas de champ dénormalisé stocké en base** (`orders.total`, `orders.items_count`, `events.total_sell`) : tous calculables à la demande, évite les désynchronisations silencieuses. Les équivalents dénormalisés pour l'affichage instantané (ex: `total` calculé, `syncStatus`) vivent uniquement dans le store Pinia côté front, jamais persistés en base.
- **Pas de table `item_price_history`** : le prix figé dans `order_lines.price` suffit comme trace historique pour la v1. À revisiter si besoin de reporting fin sur l'évolution des prix (ex: cas SaaS multi-client).
- **Une commande appartient à un seul événement** (pas de relation many-to-many `orders_to_events`).
- **`order_lines` utilise une PK composite `(order_id, item_id)`**, pas d'UUID indépendant : dérive naturellement de l'UUID déjà unique de `order_id`, pas de risque de collision offline.

## Hors scope v1 (pistes futures)

- Multi-tenant / SaaS (table `organizations`, isolation stricte, facturation).
- Historique des prix (`item_price_history`).
- Gestion de stock (volontairement absente : orders validées au paiement uniquement, pas de décrément de stock).
