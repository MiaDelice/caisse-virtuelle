<script setup lang="ts">
interface SelectableItem {
  id: number
  name: string
}

const props = defineProps<{
  options: SelectableItem[]
  placeholder: string
}>()

const selectedIds = defineModel<number[]>({ default: () => [] })

const SELECT_ALL_ID = -1

const selectMenuItems = computed(() => [
  { id: SELECT_ALL_ID, name: 'Tous' },
  ...props.options
])

const selectAllState = computed(() => {
  const total = props.options.length
  const selected = selectedIds.value.length
  if (selected === 0) return 'unchecked'
  if (selected === total) return 'checked'
  return 'indeterminate'
})

function handleUpdate(value: number[]) {
  const toggledSelectAll = value.includes(SELECT_ALL_ID)

  if (toggledSelectAll) {
    selectedIds.value = selectAllState.value === 'checked' ? [] : props.options.map((o) => o.id)
    return
  }

  selectedIds.value = value
}
</script>

<template>
  <USelectMenu
    :model-value="selectedIds"
    multiple
    :items="selectMenuItems"
    value-key="id"
    label-key="name"
    @update:model-value="handleUpdate"
  >
    <template #default>
      <span class="block w-full truncate text-left">
        <template v-if="selectedIds.length === 0">{{ placeholder }}</template>
        <template v-else-if="selectedIds.length === 1">
          {{ options.find((o) => o.id === selectedIds[0])?.name }}
        </template>
        <template v-else>{{ selectedIds.length }} sélectionnés</template>
      </span>
    </template>

    <template #item-leading="{ item }">
      <input
        v-if="item.id === SELECT_ALL_ID"
        type="checkbox"
        :checked="selectAllState === 'checked'"
        :indeterminate="selectAllState === 'indeterminate'"
        class="pointer-events-none"
      >
      <input v-else type="checkbox" :checked="selectedIds.includes(item.id)" class="pointer-events-none">
    </template>
  </USelectMenu>
</template>
