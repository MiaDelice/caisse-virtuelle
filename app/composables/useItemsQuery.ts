import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import type { Database } from '~/types/database.types'

type Item = Database['public']['Tables']['items']['Row']

const ITEMS_QUERY_KEY = ['items']

export function useItemsQuery() {
  const supabase = useSupabaseClient<Database>()

  return useQuery({
    key: ITEMS_QUERY_KEY,
    query: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('display_index', { ascending: true })

      if (error) throw error
      return data
    }
  })
}

export function useCreateItemMutation() {
  const supabase = useSupabaseClient<Database>()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async (item: Pick<Item, 'name' | 'price' | 'description'>) => {
      const { error } = await supabase.rpc('create_item', {
        item_name: item.name,
        item_price: item.price,
        item_description: item.description ?? ''
      })

      if (error) throw error
    },
    onSettled: () => queryCache.invalidateQueries({ key: ITEMS_QUERY_KEY })
  })
}

export function useUpdateItemMutation() {
  const supabase = useSupabaseClient<Database>()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async (item: Pick<Item, 'id' | 'name' | 'price' | 'description'>) => {
      const { error } = await supabase
        .from('items')
        .update({ name: item.name, price: item.price, description: item.description })
        .eq('id', item.id)

      if (error) throw error
    },
    onSettled: () => queryCache.invalidateQueries({ key: ITEMS_QUERY_KEY })
  })
}

export function useReorderItemsMutation() {
  const supabase = useSupabaseClient<Database>()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async ({ firstId, firstIndex, secondId, secondIndex }: {
      firstId: number
      firstIndex: number
      secondId: number
      secondIndex: number
    }) => {
      const { error } = await supabase.rpc('swap_items_display_index', {
        first_id: firstId,
        first_index: firstIndex,
        second_id: secondId,
        second_index: secondIndex
      })

      if (error) throw error
    },
    onSettled: () => queryCache.invalidateQueries({ key: ITEMS_QUERY_KEY })
  })
}
