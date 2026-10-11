<script setup lang="ts">
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

definePageMeta({ layout: 'unauthenticated' })

const email = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)

const supabase = useSupabaseClient()

async function handleSubmit() {
  errorMessage.value = null
  isSubmitting.value = true

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  isSubmitting.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  await navigateTo('/')
}
</script>

<template>
  <UCard class="bg-mia-secondary">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <h1 class="text-xl font-semibold">Connexion</h1>

      <UFormField label="Email" class="w-full">
        <UInput v-model="email" type="email" name="email" required autocomplete="email" class="w-full" />
      </UFormField>

      <UFormField label="Mot de passe" class="w-full">
        <UInput
          v-model="password"
          :type="isPasswordVisible ? 'text' : 'password'"
          name="password"
          required
          autocomplete="current-password"
          class="w-full"
        >
          <template #trailing>
            <UButton
              type="button"
              color="neutral"
              variant="link"
              :icon="isPasswordVisible ? EyeOffIcon : EyeIcon"
              :aria-label="isPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @click="isPasswordVisible = !isPasswordVisible"
            />
          </template>
        </UInput>
      </UFormField>

      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

      <UButton type="submit" block :loading="isSubmitting">
        Se connecter
      </UButton>
    </form>
  </UCard>
</template>
