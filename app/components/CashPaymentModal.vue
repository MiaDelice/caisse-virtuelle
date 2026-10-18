<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  validate: []
}>()

const basketStore = useBasketStore()

// Valeurs en centimes pour éviter les erreurs d'arrondi flottant.
const DENOMINATIONS = [
  { label: '1 c', valueCents: 1 },
  { label: '2 c', valueCents: 2 },
  { label: '5 c', valueCents: 5 },
  { label: '10 c', valueCents: 10 },
  { label: '20 c', valueCents: 20 },
  { label: '50 c', valueCents: 50 },
  { label: '1 €', valueCents: 100 },
  { label: '2 €', valueCents: 200 },
  { label: '5 €', valueCents: 500 },
  { label: '10 €', valueCents: 1000 },
  { label: '20 €', valueCents: 2000 }
]

const givenCents = ref(0)

const totalCents = computed(() => Math.round(basketStore.total * 100))
const changeCents = computed(() => givenCents.value - totalCents.value)

function formatCents(cents: number) {
  return (cents / 100).toFixed(2)
}

function addDenomination(valueCents: number) {
  givenCents.value += valueCents
}

function reset() {
  givenCents.value = 0
}

function handleClose() {
  reset()
  open.value = false
}

function handleValidate() {
  emit('validate')
  reset()
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Paiement en espèces" @update:open="(value) => !value && reset()">
    <template #body>
      <div class="flex flex-col gap-4">
        <p class="flex justify-between text-lg">
          <span>Total à payer</span>
          <span class="font-semibold">{{ formatCents(totalCents) }} €</span>
        </p>

        <div class="grid grid-cols-4 gap-2">
          <UButton
            v-for="denomination in DENOMINATIONS"
            :key="denomination.valueCents"
            color="neutral"
            variant="outline"
            @click="addDenomination(denomination.valueCents)"
          >
            {{ denomination.label }}
          </UButton>
        </div>

        <div class="flex flex-col gap-1 border-t border-gray-200 pt-3">
          <p class="flex justify-between">
            <span>Donné</span>
            <span>{{ formatCents(givenCents) }} €</span>
          </p>
          <p class="flex justify-between text-lg font-semibold">
            <span>Reste à rendre</span>
            <span :class="changeCents < 0 ? 'text-red-600' : ''">{{ formatCents(Math.max(changeCents, 0)) }} €</span>
          </p>
        </div>

        <UButton color="neutral" variant="ghost" size="sm" @click="reset">
          Réinitialiser
        </UButton>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-between">
        <UButton color="neutral" variant="outline" @click="handleClose">
          Fermer
        </UButton>
        <UButton color="success" :disabled="changeCents < 0" @click="handleValidate">
          Valider la commande
        </UButton>
      </div>
    </template>
  </UModal>
</template>
