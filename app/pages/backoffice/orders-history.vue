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
    <div class="flex flex-row justify-between">
      <UiMultiSelectWithAll
        v-model="selectedEventIds"
        :options="events ?? []"
        placeholder="Sélectionner des évènements"
        class="mb-4 w-64"
      />
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
        <tr v-for="order in orders" :key="order.id" class="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
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
