<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next'
import type { Database } from '~/types/database.types'

type User = Database['public']['Tables']['users']['Row']
type UserRole = User['role']

definePageMeta({ layout: 'authenticated', middleware: 'guard-require-manager' })

usePageTitle().value = 'Gestion utilisateurs'

const { data: users } = useUsersQuery()
const { mutate: updateUserRole } = useUpdateUserRoleMutation()
const { mutate: toggleUserActive } = useToggleUserActiveMutation()
const { confirm } = useAppModals()
const authUserStore = useAuthUserStore()

function isCurrentUser(user: User) {
  return user.auth_user_id === authUserStore.authenticatedUser?.id
}

const isCreateModalOpen = ref(false)

const ROLE_OPTIONS = [
  { label: 'Vendeur', value: 'SELLER' as const },
  { label: 'Manager', value: 'MANAGER' as const }
]

function handleRoleChange(user: User, role: UserRole) {
  if (role === user.role) return
  updateUserRole({ id: user.id, role })
}

async function handleToggleActive(user: User) {
  const confirmed = await confirm(
    user.is_active ? 'Désactiver cet utilisateur ?' : 'Réactiver cet utilisateur ?',
    user.is_active
      ? `${user.first_name} ${user.last_name} ne pourra plus se connecter.`
      : `${user.first_name} ${user.last_name} pourra de nouveau se connecter.`
  )
  if (confirmed) {
    toggleUserActive(user.id)
  }
}
</script>

<template>
  <div class="p-4">
    <UButton :icon="PlusIcon" class="mb-4" @click="isCreateModalOpen = true">
      Créer un utilisateur
    </UButton>

    <table class="w-full border-collapse">
      <thead>
        <tr class="border-b border-gray-200 text-left text-sm text-gray-500">
          <th class="py-2">Nom</th>
          <th class="py-2">Rôle</th>
          <th class="py-2">Statut</th>
          <th class="py-2" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" class="border-b border-gray-100">
          <td class="py-2">{{ user.first_name }} {{ user.last_name }}</td>
          <td class="py-2">
            <USelect
              :model-value="user.role"
              :items="ROLE_OPTIONS"
              value-key="value"
              label-key="label"
              class="w-40"
              @update:model-value="(role: UserRole) => handleRoleChange(user, role)"
            />
          </td>
          <td class="py-2">
            <UBadge :color="user.is_active ? 'success' : 'neutral'" variant="subtle">
              {{ user.is_active ? 'Actif' : 'Désactivé' }}
            </UBadge>
          </td>
          <td class="py-2">
            <UButton
              v-if="!isCurrentUser(user)"
              :color="user.is_active ? 'error' : 'success'"
              variant="soft"
              size="xs"
              @click="handleToggleActive(user)"
            >
              {{ user.is_active ? 'Désactiver' : 'Réactiver' }}
            </UButton>
          </td>
        </tr>
      </tbody>
    </table>

    <UserCreateModal v-model:open="isCreateModalOpen" />
  </div>
</template>
