import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import type { Database } from '~/types/database.types'

export interface OrderHistoryRow {
  id: string
  createdAt: string
  cancelledAt: string | null
  sellerFirstName: string
  sellerLastName: string
  eventId: number
  eventName: string
  quantity: number
  total: number
}

export interface OrderDetailLine {
  itemId: number
  name: string
  unitPrice: number
  quantity: number
}

const ORDERS_HISTORY_QUERY_KEY = 'orders-history'

export function useOrdersHistoryQuery(eventIds: Ref<number[]>) {
  const supabase = useSupabaseClient<Database>()

  return useQuery({
    key: () => [ORDERS_HISTORY_QUERY_KEY, ...eventIds.value.toSorted()],
    enabled: () => eventIds.value.length > 0,
    query: async (): Promise<OrderHistoryRow[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          cancelled_at,
          user:users ( first_name, last_name ),
          event:events ( id, name ),
          order_lines ( quantity, price )
        `)
        .in('event_id', eventIds.value)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map((order) => ({
        id: order.id,
        createdAt: order.created_at,
        cancelledAt: order.cancelled_at,
        sellerFirstName: order.user?.first_name ?? '',
        sellerLastName: order.user?.last_name ?? '',
        eventId: order.event?.id ?? 0,
        eventName: order.event?.name ?? '',
        quantity: order.order_lines.reduce((sum, line) => sum + line.quantity, 0),
        total: order.order_lines.reduce((sum, line) => sum + line.quantity * line.price, 0)
      }))
    }
  })
}

export function useOrderDetailQuery(orderId: Ref<string | null>) {
  const supabase = useSupabaseClient<Database>()

  return useQuery({
    key: () => ['order-detail', orderId.value],
    enabled: () => orderId.value !== null,
    query: async (): Promise<OrderDetailLine[]> => {
      const { data, error } = await supabase
        .from('order_lines')
        .select('item_id, quantity, price, item:items ( name )')
        .eq('order_id', orderId.value!)

      if (error) throw error

      return data.map((line) => ({
        itemId: line.item_id,
        name: line.item?.name ?? '',
        unitPrice: line.price,
        quantity: line.quantity
      }))
    }
  })
}

export function useCancelOrderMutation() {
  const supabase = useSupabaseClient<Database>()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ cancelled_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error
    },
    onSettled: () => queryCache.invalidateQueries({ key: [ORDERS_HISTORY_QUERY_KEY] })
  })
}
