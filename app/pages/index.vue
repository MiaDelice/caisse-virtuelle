<script setup lang="ts">
definePageMeta({ layout: 'authenticated' })

const authUserStore = useAuthUserStore()
const supabase = useSupabaseClient()

async function handleLogout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4">
    <p class="text-lg">
      Bienvenue, connecté en tant que
      <strong>{{ authUserStore.authenticatedUser?.email }}</strong>
      ({{ authUserStore.authenticatedUser?.role }})
    </p>

    <UButton color="neutral" variant="outline" @click="handleLogout">
      Se déconnecter
    </UButton>
  </div>
</template>
