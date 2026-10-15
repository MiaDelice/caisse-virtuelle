<script setup lang="ts">
definePageMeta({ layout: 'authenticated', middleware: 'guard-require-manager' })

usePageTitle().value = 'Historique des commandes'

const { data: events } = useEventsQuery()

const selectedEventIds = ref<number[]>([])

watch(events, (newEvents) => {
  if (!newEvents || selectedEventIds.value.length > 0) return
  const active = newEvents.find((event) => event.active)
  if (active) selectedEventIds.value = [active.id]
}, { immediate: true })

const showEventColumn = computed(() => selectedEventIds.value.length >= 2)

const SELECT_ALL_ID = -1

const selectMenuItems = computed(() => [
  { id: SELECT_ALL_ID, name: 'Tous' },
  ...(events.value ?? [])
])

const selectAllState = computed(() => {
  const total = events.value?.length ?? 0
  const selected = selectedEventIds.value.length
  if (selected === 0) return 'unchecked'
  if (selected === total) return 'checked'
  return 'indeterminate'
})

function handleSelectMenuUpdate(value: number[]) {
  const toggledSelectAll = value.includes(SELECT_ALL_ID)

  if (toggledSelectAll) {
    selectedEventIds.value = selectAllState.value === 'checked' ? [] : (events.value ?? []).map((e) => e.id)
    return
  }

  selectedEventIds.value = value
}

const { data: orders } = useOrdersHistoryQuery(selectedEventIds)

const selectedOrderId = ref<string | null>(null)

function formatDate(value: string) {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

const total = computed<number>(() =>
  orders.value?.reduce((sum, order) => sum + order.total, 0) ?? 0
)
</script>

<template>
  <div class="p-4">
    <div class="flex flex-row justify-between ">
      <USelectMenu :model-value="selectedEventIds" multiple :items="selectMenuItems" value-key="id" label-key="name"
        class="mb-4 w-64" @update:model-value="handleSelectMenuUpdate">
        <template #default>
          <span class="block w-full truncate text-left">
            <template v-if="selectedEventIds.length === 0">Sélectionner des évènements</template>
            <template v-else-if="selectedEventIds.length === 1">
              {{events?.find((e) => e.id === selectedEventIds[0])?.name}}
            </template>
            <template v-else>{{ selectedEventIds.length }} sélectionnés</template>
          </span>
        </template>

        <template #item-leading="{ item }">
          <input v-if="item.id === SELECT_ALL_ID" type="checkbox" :checked="selectAllState === 'checked'"
            :indeterminate="selectAllState === 'indeterminate'" class="pointer-events-none">
          <input v-else type="checkbox" :checked="selectedEventIds.includes(item.id)" class="pointer-events-none">
        </template>
      </USelectMenu>
      <span class="underline underline-offset-2 text-lg">Recette totale: {{ total.toFixed(2) }}€</span>
    </div>


    <p v-if="selectedEventIds.length === 0" class="text-md text-gray-500 text-center">
      Aucun évènement sélectionné.
    </p>

    <table v-else class="w-full border-collapse">
      <thead>
        <tr class="border-b border-gray-200 text-left text-sm text-gray-500">
          <th class="py-2">Date</th>
          <th class="py-2">Vendeur</th>
          <th v-if="showEventColumn" class="py-2">Évènement</th>
          <th class="py-2">Quantité</th>
          <th class="py-2">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id" class=" cursor-pointer border-b border-gray-100 hover:bg-gray-50"
          @click="selectedOrderId = order.id">
          <td class="py-2">{{ formatDate(order.createdAt) }}</td>
          <td class="py-2">{{ order.sellerFirstName }} {{ order.sellerLastName }}</td>
          <td v-if="showEventColumn" class="py-2">{{ order.eventName }}</td>
          <td class="py-2">{{ order.quantity }}</td>
          <td class="py-2">{{ order.total.toFixed(2) }}€</td>
        </tr>
      </tbody>
    </table>

    <OrderDetailModal v-model:order-id="selectedOrderId" />
  </div>
</template>
