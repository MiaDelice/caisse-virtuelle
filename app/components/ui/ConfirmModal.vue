<script setup lang="ts">
const props = defineProps<{
  title: string
  message: string
}>()

const emit = defineEmits<{ close: [confirmed: boolean] }>()
</script>

<template>
  <UModal :title="props.title" @close="emit('close', false)">
    <template #body>
      <p>{{ props.message }}</p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="emit('close', false)">
          Annuler
        </UButton>
        <UButton color="primary" @click="emit('close', true)">
          Confirmer
        </UButton>
      </div>
    </template>
  </UModal>
</template>
