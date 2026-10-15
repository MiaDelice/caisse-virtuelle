<script setup lang="ts">
import { PlusIcon, MinusIcon, Trash2Icon } from 'lucide-vue-next'

const open = defineModel<boolean>('open', { default: false })

const basketStore = useBasketStore()
</script>

<template>
  <UModal v-model:open="open" title="Modifier le panier">
    <template #body>
      <div class="flex flex-col gap-3">
        <p v-if="basketStore.lines.length === 0" class="text-sm text-gray-500">
          Le panier est vide.
        </p>

        <div
          v-for="line in basketStore.lines"
          :key="line.itemId"
          class="flex items-center justify-between gap-2 border-b border-gray-200 pb-2"
        >
          <div class="flex flex-col">
            <span class="font-medium">{{ line.name }}</span>
            <span class="text-sm text-gray-500">{{ line.unitPrice.toFixed(2) }} € / unité</span>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              :icon="MinusIcon"
              size="xs"
              variant="outline"
              color="neutral"
              @click="basketStore.decrement(line.itemId)"
            />
            <span class="w-6 text-center">{{ line.quantity }}</span>
            <UButton
              :icon="PlusIcon"
              size="xs"
              variant="outline"
              color="neutral"
              @click="basketStore.increment(line.itemId)"
            />
            <UButton
              :icon="Trash2Icon"
              size="xs"
              variant="ghost"
              color="error"
              @click="basketStore.removeItem(line.itemId)"
            />
          </div>
        </div>

        <div v-if="basketStore.lines.length > 0" class="flex justify-between pt-2 font-semibold">
          <span>Total</span>
          <span>{{ basketStore.total.toFixed(2) }} €</span>
        </div>
      </div>
    </template>
  </UModal>
</template>
