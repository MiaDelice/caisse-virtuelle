<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Item = Database['public']['Tables']['items']['Row']

definePageMeta({ layout: 'authenticated' })

usePageTitle().value = 'Caisse'

const basketStore = useBasketStore()
const { data: events } = useEventsQuery()
const { mutate: submitOrder, isLoading: isSubmitting } = useSubmitOrderMutation()

const isEditModalOpen = ref(false)
const isCashModalOpen = ref(false)

function handleSelectItem(item: Item) {
  basketStore.addItem(item)
}

function handleValidate() {
  if (basketStore.lines.length === 0) return

  const activeEventId = events.value?.find((e) => e.active)?.id
  if (!activeEventId) return

  submitOrder({ lines: basketStore.lines, eventId: activeEventId })
}
</script>

<template>
  <div class="flex h-full flex-1">
    <div class="w-3/4 overflow-y-auto">
      <ItemsGrid @select="handleSelectItem" />
    </div>

    <div class="flex w-1/4 flex-col justify-between gap-5 border-l border-mia-primary bg-white p-4">
      <div class="flex h-full min-h-0 flex-col">
        <h2 class="mb-2 text-lg font-semibold">Panier</h2>

        <ul class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border-2 border-solid border-mia-primary p-3">
          <li v-if="basketStore.lines.length === 0" class="text-sm text-gray-500">
            Le panier est vide.
          </li>

          <li v-for="line in basketStore.lines" :key="line.itemId" class="flex flex-col">
            <div class="flex flex-row justify-between">
              <span>{{ line.name }}</span>
              <span class="text-gray-400">{{ line.unitPrice.toFixed(2) }}€</span>
            </div>
            <div class="flex flex-row justify-between">
              <span>x{{ line.quantity }}</span>
              <span>{{ (line.unitPrice * line.quantity).toFixed(2) }}€</span>
            </div>
          </li>
        </ul>

        <p v-if="basketStore.lines.length > 0" class="mt-2 flex shrink-0 justify-between font-semibold">
          <span>Total</span>
          <span>{{ basketStore.total.toFixed(2) }}€</span>
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <button
          type="button"
          class="w-full rounded-xl bg-warning py-2"
          :disabled="basketStore.lines.length === 0"
          @click="isEditModalOpen = true"
        >
          Modifier le panier
        </button>
        <button
          type="button"
          class="w-full rounded-xl border-2 border-success py-2 text-success"
          :disabled="basketStore.lines.length === 0 || isSubmitting"
          @click="isCashModalOpen = true"
        >
          Espèces
        </button>
        <button
          type="button"
          class="w-full rounded-xl bg-success py-2"
          :disabled="basketStore.lines.length === 0 || isSubmitting"
          @click="handleValidate"
        >
          Valider le panier
        </button>
      </div>
    </div>

    <BasketEditModal v-model:open="isEditModalOpen" />
    <CashPaymentModal v-model:open="isCashModalOpen" @validate="handleValidate" />
  </div>
</template>
