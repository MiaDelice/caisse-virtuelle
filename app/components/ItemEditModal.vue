<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Item = Database['public']['Tables']['items']['Row']

const props = defineProps<{
  item: Item | null
}>()

const open = defineModel<boolean>('open', { default: false })

const { mutate: updateItem, isLoading } = useUpdateItemMutation()

const name = ref('')
const price = ref('0.00')
const description = ref('')

watch(() => props.item, (item) => {
  if (!item) return
  name.value = item.name
  price.value = item.price.toFixed(2)
  description.value = item.description ?? ''
}, { immediate: true })

function formatPrice() {
  const parsed = Number.parseFloat(price.value)
  price.value = Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00'
}

function handleSave() {
  if (!props.item) return

  formatPrice()

  updateItem(
    {
      id: props.item.id,
      name: name.value,
      price: Number.parseFloat(price.value),
      description: description.value || null
    },
    { onSuccess: () => { open.value = false } }
  )
}
</script>

<template>
  <UModal v-model:open="open" title="Modifier le produit">
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Nom">
          <UInput v-model="name" class="w-full" />
        </UFormField>

        <UFormField label="Prix (€)">
          <UInput v-model="price" type="number" step="0.01" class="w-full" @blur="formatPrice" />
        </UFormField>

        <UFormField label="Description">
          <UTextarea v-model="description" class="w-full" />
        </UFormField>

        <UButton block :loading="isLoading" @click="handleSave">
          Enregistrer
        </UButton>
      </div>
    </template>
  </UModal>
</template>
