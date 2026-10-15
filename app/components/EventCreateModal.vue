<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const { mutate: createEvent, isLoading } = useCreateEventMutation()

const name = ref('')
const startAt = ref('')
const endAt = ref('')

function reset() {
  name.value = ''
  startAt.value = ''
  endAt.value = ''
}

function handleSave() {
  if (!name.value || !startAt.value) return

  createEvent(
    {
      name: name.value,
      start_at: new Date(startAt.value).toISOString(),
      end_at: endAt.value ? new Date(endAt.value).toISOString() : null
    },
    {
      onSuccess: () => {
        reset()
        open.value = false
      }
    }
  )
}
</script>

<template>
  <UModal v-model:open="open" title="Créer un évènement" :dismissible="false">
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Nom">
          <UInput v-model="name" class="w-full" />
        </UFormField>

        <UFormField label="Début">
          <UInput v-model="startAt" type="datetime-local" class="w-full" />
        </UFormField>

        <UFormField label="Fin (optionnel)">
          <UInput v-model="endAt" type="datetime-local" class="w-full" />
        </UFormField>

        <UButton block :loading="isLoading" :disabled="!name || !startAt" @click="handleSave">
          Créer
        </UButton>
      </div>
    </template>
  </UModal>
</template>
