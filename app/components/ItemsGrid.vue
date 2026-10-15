<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'
import type { Database } from '~/types/database.types'

type Item = Database['public']['Tables']['items']['Row']

const props = withDefaults(defineProps<{
  editionMode?: boolean
}>(), {
  editionMode: false
})

const emit = defineEmits<{
  select: [item: Item]
}>()

const { data: items } = useItemsQuery()
const { data: events } = useEventsQuery()

const activeEventId = computed(() => events.value?.find((e) => e.active)?.id ?? null)
const { data: activeEventItemIds } = useEventItemsQuery(activeEventId)

const displayedItems = computed(() => {
  if (props.editionMode || !activeEventItemIds.value) return items.value ?? []
  return (items.value ?? []).filter((item) => activeEventItemIds.value!.includes(item.id))
})

const editedItem = ref<Item | null>(null)
const isModalOpen = ref(false)
const pressedItemId = ref<number | null>(null)

const PRESS_FEEDBACK_DELAY_MS = 120

function handleClick(item: Item, editionMode: boolean) {
  pressedItemId.value = item.id

  setTimeout(() => {
    pressedItemId.value = null

    if (editionMode) {
      editedItem.value = item
      isModalOpen.value = true
      return
    }

    emit('select', item)
  }, PRESS_FEEDBACK_DELAY_MS)
}

function handleCreateClick() {
  editedItem.value = null
  isModalOpen.value = true
}
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 px-4 py-2">
    <button
      v-for="item in displayedItems"
      :key="item.id"
      type="button"
      class="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-mia-secondary bg-mia-primary p-4 text-center transition-all duration-100"
      :class="pressedItemId === item.id ? 'scale-95 opacity-75' : ''"
      @click="handleClick(item, editionMode)"
    >
      <span class="text-base font-semibold">{{ item.name }}</span>
      <span class="text-sm">{{ item.price.toFixed(2) }} €</span>
    </button>

    <button
      v-if="editionMode"
      type="button"
      class="flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-mia-primary text-mia-primary transition-all duration-100 active:scale-95"
      @click="handleCreateClick"
    >
      <PlusIcon class="size-10" />
    </button>
  </div>

  <ItemEditModal v-if="editionMode" v-model:open="isModalOpen" :item="editedItem" />
</template>
