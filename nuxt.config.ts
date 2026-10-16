// https://nuxt.com/docs/api/configuration/nuxt-config
import { version as appVersion } from './package.json'

// Couleurs pilotables au build via env vars (utile pour personnaliser par
// client si ce projet devient multi-tenant un jour) — valeur par défaut
// volontairement criarde pour qu'on n'oublie pas de la remplacer par la
// vraie identité visuelle de la pâtisserie.
const pwaThemeColor = process.env.NUXT_PUBLIC_PWA_THEME_COLOR || '#00ff00'
const pwaBackgroundColor = process.env.NUXT_PUBLIC_PWA_BACKGROUND_COLOR || '#00ff00'

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@pinia/colada-nuxt', '@vite-pwa/nuxt', '@nuxt/ui', '@nuxtjs/supabase'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  ssr: false,
  runtimeConfig: {
    public: {
      appVersion
    }
  },
  // Thème clair uniquement : pas de bascule clair/sombre pour cette app.
  ui: {
    colorMode: false
  },
  supabase: {
    url: process.env.SUPABASE_PROJECT_URL,
    key: process.env.SUPABASE_PUBLISHABLE_KEY,
    // Clé admin, strictement côté serveur (jamais dans runtimeConfig.public).
    // Utilisée uniquement par server/api/users pour créer des comptes Auth.
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    // Redirections gérées à la main via middleware/guard.*.ts, pas par le module.
    redirect: false
  },
  pwa: {
    filename: 'pwa-auto-update-sw.js',
    registerType: 'autoUpdate',
    manifest: {
      name: 'Caisse Virtuelle',
      short_name: 'Caisse',
      description: 'Application de caisse virtuelle pour évènements de vente exceptionnels',
      theme_color: pwaThemeColor,
      background_color: pwaBackgroundColor,
      display: 'standalone',
      icons: [
        {
          src: 'app_icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'app_icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
    },
    devOptions: {
      enabled: false
    }
  }
})