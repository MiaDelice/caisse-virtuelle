import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import type { Database } from '~/types/database.types'

type User = Database['public']['Tables']['users']['Row']
type UserRole = User['role']

const USERS_QUERY_KEY = ['users']

export function useUsersQuery() {
  const supabase = useSupabaseClient<Database>()

  return useQuery({
    key: USERS_QUERY_KEY,
    query: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })
}

export function useUpdateUserRoleMutation() {
  const supabase = useSupabaseClient<Database>()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async ({ id, role }: { id: User['id']; role: UserRole }) => {
      const { error } = await supabase.from('users').update({ role }).eq('id', id)
      if (error) throw error
    },
    onSettled: () => queryCache.invalidateQueries({ key: USERS_QUERY_KEY })
  })
}

export function useCreateUserMutation() {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async (user: { email: string; password: string; firstName: string; lastName: string; role: UserRole }) => {
      await $fetch('/api/users', { method: 'POST', body: user })
    },
    onSettled: () => queryCache.invalidateQueries({ key: USERS_QUERY_KEY })
  })
}

export function useToggleUserActiveMutation() {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async (id: User['id']) => {
      await $fetch(`/api/users/${id}/toggle-active`, { method: 'POST' })
    },
    onSettled: () => queryCache.invalidateQueries({ key: USERS_QUERY_KEY })
  })
}
