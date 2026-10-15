import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import type { Database } from '~/types/database.types'

type Event = Database['public']['Tables']['events']['Row']

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

export function useEventItemsQuery(eventId: Ref<number | null>) {
  const supabase = useSupabaseClient<Database>()

  return useQuery({
    key: () => ['event-items', eventId.value],
    enabled: () => eventId.value !== null,
    query: async () => {
      const { data, error } = await supabase
        .from('event_items')
        .select('item_id')
        .eq('event_id', eventId.value!)

      if (error) throw error
      return data.map((row) => row.item_id)
    }
  })
}

export function useCreateEventMutation() {
  const supabase = useSupabaseClient<Database>()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async (event: { name: string; start_at: string; end_at: string | null; sellableItemIds: number[] }) => {
      const { error } = await supabase.rpc('create_event', {
        event_name: event.name,
        event_start_at: event.start_at,
        event_end_at: event.end_at,
        sellable_item_ids: event.sellableItemIds
      })
      if (error) throw error
    },
    onSettled: () => queryCache.invalidateQueries({ key: EVENTS_QUERY_KEY })
  })
}

export function useUpdateEventMutation() {
  const supabase = useSupabaseClient<Database>()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async (event: { id: Event['id']; name: string; sellableItemIds: number[] }) => {
      const { error } = await supabase.rpc('update_event', {
        target_event_id: event.id,
        event_name: event.name,
        sellable_item_ids: event.sellableItemIds
      })
      if (error) throw error
    },
    onSettled: () => {
      queryCache.invalidateQueries({ key: EVENTS_QUERY_KEY })
      queryCache.invalidateQueries({ key: ['event-items'] })
    }
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
