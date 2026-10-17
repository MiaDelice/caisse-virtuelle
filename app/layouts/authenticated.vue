<script setup lang="ts">
import { ChevronDownIcon, LogOutIcon, RefreshCwIcon } from 'lucide-vue-next'
import type { DropdownMenuItem } from '@nuxt/ui'

const authUserStore = useAuthUserStore()
const supabase = useSupabaseClient()
const { public: { appVersion } } = useRuntimeConfig()

const isOnline = useOnlineStatus()
const offlineQueue = useOfflineOrderQueueStore()
const { sync } = useOfflineOrderSync()

onMounted(() => offlineQueue.hydrate())

watch(isOnline, (online, wasOnline) => {
  if (online && !wasOnline) void sync()
})

const pageTitle = usePageTitle()
const route = useRoute()

watch(() => route.fullPath, () => { pageTitle.value = null }, { immediate: true })

const headerTitle = computed(() => pageTitle.value ? `Caisse virtuelle - ${pageTitle.value}` : 'Caisse virtuelle')

const initials = computed(() => {
  const user = authUserStore.authenticatedUser
  if (!user) return ''

  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
})

const menuItems = computed(() => {
  const items: DropdownMenuItem[][] = [[{ label: 'Caisse', to: '/caisse' }]]

  if (authUserStore.authenticatedUser?.role === 'MANAGER') {
    items.push([
      { label: 'Gestion produits', to: '/backoffice/items' },
      { label: 'Gestion évènements', to: '/backoffice/events' },
      { label: 'Gestion utilisateurs', to: '/backoffice/users' },
      { label: 'Historique des commandes', to: '/backoffice/orders-history' }
    ])
  }

  items.push([{
    label: offlineQueue.pendingCount > 0 ? `Synchroniser (${offlineQueue.pendingCount})` : 'Synchroniser',
    icon: RefreshCwIcon,
    onSelect: () => sync()
  }])

  items.push([{ label: 'Déconnexion', icon: LogOutIcon, color: 'error' as const, onSelect: handleLogout }])

  return items
})

async function handleLogout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-mia-secondary">
    <header class="flex items-center justify-between bg-mia-primary px-4 py-2">
      <img
        src="~/assets/images/logos/logo-black-no-bg.png"
        alt="Mia Délice"
        class="h-10 w-10 object-contain"
      >

      <h1 class="text-lg font-semibold">{{ headerTitle }}</h1>

      <UDropdownMenu :items="menuItems">
        <button type="button" class="flex items-center gap-1">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-mia-secondary text-sm font-medium">
            {{ initials }}
          </span>
          <ChevronDownIcon class="size-4" />
        </button>

        <template #content-top>
          <div class="px-3 py-2">
            <p class="text-sm font-medium">
              {{ authUserStore.authenticatedUser?.firstName }} {{ authUserStore.authenticatedUser?.lastName }}
            </p>
            <p class="text-xs text-gray-500">{{ authUserStore.authenticatedUser?.email }}</p>
          </div>
        </template>

        <template #content-bottom>
          <div class="flex justify-end px-3 py-2">
            <UBadge color="neutral" variant="subtle" size="sm" class="rounded-full">
              Version {{ appVersion }}
            </UBadge>
          </div>
        </template>
      </UDropdownMenu>
    </header>

    <main class="flex flex-1 flex-col overflow-hidden">
      <slot />
    </main>
  </div>
</template>
