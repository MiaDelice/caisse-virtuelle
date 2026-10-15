<script setup lang="ts">
const props = defineProps<{
  title: string
  message: string
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <UModal :title="props.title" @close="emit('close')">
    <template #body>
      <p>{{ props.message }}</p>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton color="primary" @click="emit('close')">
          OK
        </UButton>
      </div>
    </template>
  </UModal>
</template>
