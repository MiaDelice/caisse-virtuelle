<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const { mutateAsync: createUser, isLoading } = useCreateUserMutation()

const email = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')
const role = ref<'SELLER' | 'MANAGER'>('SELLER')
const errorMessage = ref<string | null>(null)

const ROLE_OPTIONS = [
  { label: 'Vendeur', value: 'SELLER' as const },
  { label: 'Manager', value: 'MANAGER' as const }
]

function reset() {
  email.value = ''
  password.value = ''
  firstName.value = ''
  lastName.value = ''
  role.value = 'SELLER'
  errorMessage.value = null
}

const isFormValid = computed(() =>
  email.value && password.value.length >= 6 && firstName.value && lastName.value
)

async function handleSave() {
  if (!isFormValid.value) return

  errorMessage.value = null

  try {
    await createUser({
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
      role: role.value
    })
    reset()
    open.value = false
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erreur inattendue.'
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Créer un utilisateur">
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Prénom">
          <UInput v-model="firstName" class="w-full" />
        </UFormField>

        <UFormField label="Nom">
          <UInput v-model="lastName" class="w-full" />
        </UFormField>

        <UFormField label="Email">
          <UInput v-model="email" type="email" class="w-full" />
        </UFormField>

        <UFormField label="Mot de passe temporaire">
          <UInput v-model="password" type="password" class="w-full" />
        </UFormField>

        <UFormField label="Rôle">
          <USelect v-model="role" :items="ROLE_OPTIONS" value-key="value" label-key="label" class="w-full" />
        </UFormField>

        <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

        <UButton block :loading="isLoading" :disabled="!isFormValid" @click="handleSave">
          Créer
        </UButton>
      </div>
    </template>
  </UModal>
</template>
