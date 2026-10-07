-- Schéma initial caisse-virtuelle (voir docs/schema.md pour le détail des décisions).
-- RLS est activé sur chaque table dès sa création (config projet "automatic RLS"),
-- aucune policy n'est définie ici : toutes les tables sont donc fermées à tout accès
-- via l'API tant que des policies explicites n'ont pas été ajoutées.

create table public.users (
  id bigint generated always as identity primary key,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  role text not null check (role in ('SELLER', 'MANAGER')),
  created_at timestamptz not null default now()
);

create unique index users_auth_user_id_key on public.users (auth_user_id);

alter table public.users enable row level security;

create table public.items (
  id bigint generated always as identity primary key,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  description text,
  created_at timestamptz not null default now()
);

alter table public.items enable row level security;

create table public.events (
  id bigint generated always as identity primary key,
  name text not null,
  start_at timestamptz not null,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  constraint events_end_after_start check (end_at is null or end_at >= start_at)
);

alter table public.events enable row level security;

create table public.orders (
  id uuid primary key,
  event_id bigint not null references public.events (id) on delete restrict,
  user_id bigint not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index orders_event_id_idx on public.orders (event_id);
create index orders_user_id_idx on public.orders (user_id);

alter table public.orders enable row level security;

create table public.order_lines (
  order_id uuid not null references public.orders (id) on delete cascade,
  item_id bigint not null references public.items (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0),
  primary key (order_id, item_id)
);

alter table public.order_lines enable row level security;
