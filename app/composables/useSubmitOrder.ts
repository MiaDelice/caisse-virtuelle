import { useMutation } from '@pinia/colada'
import type { Database } from '~/types/database.types'
import type { BasketLine } from '~/stores/basket'

export function useSubmitOrderMutation() {
  const supabase = useSupabaseClient<Database>()
  const authUserStore = useAuthUserStore()
  const basketStore = useBasketStore()
  const toast = useToast()

  return useMutation({
    mutation: async (lines: BasketLine[]) => {
      const [userRow, activeEventRow] = await Promise.all([
        supabase.from('users').select('id').eq('auth_user_id', authUserStore.authenticatedUser!.id).single(),
        supabase.from('events').select('id').eq('active', true).single()
      ])

      if (userRow.error) throw userRow.error
      if (activeEventRow.error) throw activeEventRow.error

      const orderId = crypto.randomUUID()

      const orderInsert = await supabase.from('orders').insert({
        id: orderId,
        event_id: activeEventRow.data.id,
        user_id: userRow.data.id
      })

      if (orderInsert.error) throw orderInsert.error

      const orderLinesInsert = await supabase.from('order_lines').insert(
        lines.map((line) => ({
          order_id: orderId,
          item_id: line.itemId,
          quantity: line.quantity,
          price: line.unitPrice
        }))
      )

      if (orderLinesInsert.error) throw orderLinesInsert.error

      return orderId
    },
    onSuccess: () => {
      basketStore.clear()
      toast.add({ title: 'Commande enregistrée', color: 'success' })
    },
    onError: () => {
      toast.add({ title: 'Échec de l\'enregistrement', description: 'Réessaie.', color: 'error' })
    }
  })
}
