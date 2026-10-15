import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import type { Database } from '~/types/database.types'

type Event = Database['public']['Tables']['events']['Row']
type EventInsert = Database['public']['Tables']['events']['Insert']

const EVENTS_QUERY_KEY = ['events']

export function useEventsQuery() {
  const supabase = useSupabaseClient<Database>()

  return useQuery({
    key: EVENTS_QUERY_KEY,
    query: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })
}

export function useCreateEventMutation() {
  const supabase = useSupabaseClient<Database>()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async (event: Pick<EventInsert, 'name' | 'start_at' | 'end_at'>) => {
      const { error } = await supabase.from('events').insert(event)
      if (error) throw error
    },
    onSettled: () => queryCache.invalidateQueries({ key: EVENTS_QUERY_KEY })
  })
}

export function useActivateEventMutation() {
  const supabase = useSupabaseClient<Database>()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async (eventId: Event['id']) => {
      const { error } = await supabase.rpc('activate_event', { target_event_id: eventId })
      if (error) throw error
    },
    onSettled: () => queryCache.invalidateQueries({ key: EVENTS_QUERY_KEY })
  })
}
