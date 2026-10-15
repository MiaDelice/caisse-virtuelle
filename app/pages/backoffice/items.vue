<script setup lang="ts">
definePageMeta({ layout: 'authenticated', middleware: 'guard-require-manager' })

usePageTitle().value = 'Gestion des produits'
</script>

<template>
  <ItemsGrid edition-mode />
</template>
