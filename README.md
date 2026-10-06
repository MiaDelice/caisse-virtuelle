# caisse-virtuelle
Application de caisse virtuelle pour les braderie, représentations commerçantes, et autre évènements de vente exceptionnelles (originellement pour la pâtisserie/salon de thé Mia Délice)

## Stack

- Front : [Nuxt](https://nuxt.com) (Vue 3) + [Pinia](https://pinia.vuejs.org) + PWA (`@vite-pwa/nuxt`)
- Données : Supabase (Postgres + Auth)
- Hébergement : Netlify

Voir [docs/schema.md](./docs/schema.md) pour le schéma de données.

## Développement

Installer les dépendances :

```bash
npm install
```

Lancer le serveur de développement sur `http://localhost:3000` :

```bash
npm run dev
```

Build de production :

```bash
npm run build
```

Prévisualiser le build de production en local :

```bash
npm run preview
```
