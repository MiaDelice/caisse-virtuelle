<script setup lang="ts">
import { ChevronDownIcon, LogOutIcon } from 'lucide-vue-next'

const authUserStore = useAuthUserStore()
const supabase = useSupabaseClient()
const { public: { appVersion } } = useRuntimeConfig()

const initials = computed(() => {
  const user = authUserStore.authenticatedUser
  if (!user) return ''

  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
})

const menuItems = computed(() => {
  const items = []

  if (authUserStore.authenticatedUser?.role === 'MANAGER') {
    items.push([{ label: 'Backoffice', to: '/backoffice' }])
  }

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
      <div class="flex h-10 w-10 items-center justify-center rounded bg-white/50 text-xs text-gray-600">
        Logo
      </div>

      <h1 class="text-lg font-semibold">Caisse virtuelle</h1>

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

    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
