import { useMutation } from '@pinia/colada'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'
import type { BasketLine } from '~/stores/basket'
import type { QueuedOrder } from '~/stores/offlineOrderQueue'

export function useSubmitOrderMutation() {
  const basketStore = useBasketStore()
  const authUserStore = useAuthUserStore()
  const queue = useOfflineOrderQueueStore()
  const supabase = useSupabaseClient<Database>()
  const toast = useToast()
  const { sync } = useOfflineOrderSync()

  return useMutation({
    mutation: async ({ lines, eventId }: { lines: BasketLine[]; eventId: number }) => {
      const userId = await resolveCurrentUserId(supabase, authUserStore.authenticatedUser!.id)
      if (userId === null) throw new Error('Utilisateur introuvable (hors ligne, jamais synchronisé).')

      await queue.hydrate()
      await queue.enqueue({
        id: crypto.randomUUID(),
        eventId,
        userId,
        createdAt: new Date().toISOString(),
        lines
      })
    },
    onSuccess: () => {
      basketStore.clear()
      toast.add({ title: 'Commande enregistrée', description: 'Synchronisation en cours…', color: 'success' })
      void sync()
    },
    onError: (error) => {
      toast.add({
        title: 'Échec de l\'enregistrement',
        description: error instanceof Error ? error.message : 'Réessaie.',
        color: 'error'
      })
    }
  })
}

async function resolveCurrentUserId(supabase: SupabaseClient<Database>, authUserId: string): Promise<number | null> {
  const { data, error } = await supabase.from('users').select('id').eq('auth_user_id', authUserId).single()

  if (!error && data) {
    await cacheUserId(authUserId, data.id)
    return data.id
  }

  return await getCachedUserId(authUserId)
}

export function useOfflineOrderSync() {
  const supabase = useSupabaseClient<Database>()
  const queue = useOfflineOrderQueueStore()
  const toast = useToast()

  async function syncOne(order: QueuedOrder) {
    await queue.markSyncing(order.id)

    const orderInsert = await supabase.from('orders').insert({
      id: order.id,
      event_id: order.eventId,
      user_id: order.userId,
      created_at: order.createdAt
    })

    // 23505 = violation d'unicité : déjà synchronisée lors d'un essai
    // précédent, on le traite comme un succès (idempotence par UUID).
    if (orderInsert.error && orderInsert.error.code !== '23505') {
      await queue.markError(order.id, orderInsert.error.message)
      return false
    }

    const orderLinesInsert = await supabase.from('order_lines').insert(
      order.lines.map((line) => ({
        order_id: order.id,
        item_id: line.itemId,
        quantity: line.quantity,
        price: line.unitPrice
      }))
    )

    if (orderLinesInsert.error && orderLinesInsert.error.code !== '23505') {
      await queue.markError(order.id, orderLinesInsert.error.message)
      return false
    }

    await queue.markSynced(order.id)
    return true
  }

  async function sync() {
    await queue.hydrate()

    const pending = queue.orders.filter((o) => o.syncStatus === 'pending' || o.syncStatus === 'error')
    if (pending.length === 0) return

    let successCount = 0
    let errorCount = 0

    for (const order of pending) {
      const ok = await syncOne(order)
      if (ok) successCount++
      else errorCount++
    }

    if (successCount > 0) {
      toast.add({ title: `${successCount} commande(s) synchronisée(s)`, color: 'success' })
    }
    if (errorCount > 0) {
      toast.add({
        title: `${errorCount} commande(s) en échec`,
        description: 'Nouvelle tentative plus tard.',
        color: 'error'
      })
    }
  }

  return { sync }
}
