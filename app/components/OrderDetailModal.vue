<script setup lang="ts">
const props = defineProps<{
  isCancelled?: boolean
}>()

const orderId = defineModel<string | null>('orderId', { default: null })

const { data: lines, isLoading } = useOrderDetailQuery(orderId)
const { mutateAsync: cancelOrder, isLoading: isCancelling } = useCancelOrderMutation()
const { confirm } = useAppModals()

const total = computed(() =>
  lines.value?.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0) ?? 0
)

function handleClose() {
  orderId.value = null
}

async function handleCancelOrder() {
  if (!orderId.value) return

  const confirmed = await confirm(
    'Annuler cette commande ?',
    'Elle sera exclue des totaux mais restera visible dans l\'historique.'
  )
  if (!confirmed) return

  await cancelOrder(orderId.value)
  handleClose()
}
</script>

<template>
  <UModal :open="orderId !== null" title="Détail de la commande" @update:open="(value) => !value && handleClose()">
    <template #body>
      <p v-if="isLoading" class="text-sm text-gray-500">Chargement…</p>

      <div v-else class="flex flex-col gap-2">
        <div v-for="line in lines" :key="line.itemId" class="flex flex-col">
          <div class="flex flex-row justify-between">
            <span>{{ line.name }}</span>
            <span class="text-gray-400">{{ line.unitPrice.toFixed(2) }}€</span>
          </div>
          <div class="flex flex-row justify-between">
            <span>x{{ line.quantity }}</span>
            <span>{{ (line.unitPrice * line.quantity).toFixed(2) }}€</span>
          </div>
        </div>

        <p class="mt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>{{ total.toFixed(2) }}€</span>
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-between">
        <UButton
          v-if="!props.isCancelled"
          color="error"
          variant="soft"
          :loading="isCancelling"
          @click="handleCancelOrder"
        >
          Annuler la commande
        </UButton>
        <div v-else />

        <UButton color="primary" @click="handleClose">
          Ok
        </UButton>
      </div>
    </template>
  </UModal>
</template>
