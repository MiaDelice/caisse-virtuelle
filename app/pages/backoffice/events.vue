<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'
import type { Database } from '~/types/database.types'

type Event = Database['public']['Tables']['events']['Row']

definePageMeta({ layout: 'authenticated', middleware: 'guard-require-manager' })

usePageTitle().value = 'Gestion évènements'

const { data: events } = useEventsQuery()
const { mutate: activateEvent } = useActivateEventMutation()
const { confirm, info } = useAppModals()

const isCreateModalOpen = ref(false)

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

async function handleRowClick(event: Event) {
  if (event.active) {
    if (event.is_default) {
      await info('Action impossible', 'Impossible de désactiver cet évènement.')
      return
    }

    const defaultEvent = events.value?.find((e) => e.is_default)
    const confirmed = await confirm(
      'Désactiver cet évènement ?',
      `Désactiver cet évènement pour réactiver "${defaultEvent?.name}" ?`
    )
    if (confirmed && defaultEvent) {
      activateEvent(defaultEvent.id)
    }
    return
  }

  const confirmed = await confirm(
    'Activer cet évènement ?',
    `Les prochaines ventes seront associées à "${event.name}".`
  )
  if (confirmed) {
    activateEvent(event.id)
  }
}
</script>

<template>
  <div class="p-4">
    <UButton :icon="PlusIcon" class="mb-4" @click="isCreateModalOpen = true">
      Créer un nouvel évènement
    </UButton>

    <table class="w-full border-collapse">
      <thead>
        <tr class="border-b border-gray-200 text-left text-sm text-gray-500">
          <th class="py-2">Nom</th>
          <th class="py-2">Date</th>
          <th class="py-2">Créé le</th>
          <th class="py-2">Actif</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="event in events"
          :key="event.id"
          class="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
          @click="handleRowClick(event)"
        >
          <td class="py-2">{{ event.name }}</td>
          <td class="py-2">
            <div class="flex flex-col text-sm">
              <span>{{ formatDate(event.start_at) }}</span>
              <span>{{ formatDate(event.end_at) }}</span>
            </div>
          </td>
          <td class="py-2">{{ formatDate(event.created_at) }}</td>
          <td class="py-2">
            <UBadge :color="event.active ? 'success' : 'neutral'" variant="subtle">
              {{ event.active ? 'Actif' : 'Inactif' }}
            </UBadge>
          </td>
        </tr>
      </tbody>
    </table>

    <EventCreateModal v-model:open="isCreateModalOpen" />
  </div>
</template>
