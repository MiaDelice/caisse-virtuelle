<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Event = Database['public']['Tables']['events']['Row']

const props = defineProps<{
  event: Event | null
}>()

const open = defineModel<boolean>('open', { default: false })

const { mutateAsync: updateEvent, isLoading } = useUpdateEventMutation()
const { data: items } = useItemsQuery()

const eventId = computed(() => props.event?.id ?? null)
const { data: currentSellableItemIds } = useEventItemsQuery(eventId)

const name = ref('')
const sellableItemIds = ref<number[]>([])

watch(() => props.event, (event) => {
  if (!event) return
  name.value = event.name
}, { immediate: true })

watch(currentSellableItemIds, (ids) => {
  if (ids) sellableItemIds.value = ids
})

async function handleSave() {
  if (!props.event || !name.value) return

  await updateEvent({ id: props.event.id, name: name.value, sellableItemIds: sellableItemIds.value })
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Modifier l'évènement">
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Nom">
          <UInput v-model="name" class="w-full" />
        </UFormField>

        <UFormField label="Produits vendables">
          <UiMultiSelectWithAll
            v-model="sellableItemIds"
            :options="items ?? []"
            placeholder="Sélectionner des produits"
            class="w-full"
          />
        </UFormField>

        <UButton block :loading="isLoading" :disabled="!name" @click="handleSave">
          Enregistrer
        </UButton>
      </div>
    </template>
  </UModal>
</template>
