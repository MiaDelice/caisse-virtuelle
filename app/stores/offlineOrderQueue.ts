import { get, set, del } from 'idb-keyval'
import type { BasketLine } from '~/stores/basket'

export interface QueuedOrder {
  id: string
  eventId: number
  userId: number
  createdAt: string
  lines: BasketLine[]
  syncStatus: 'pending' | 'syncing' | 'error'
  syncError?: string
}

const STORAGE_KEY = 'offline-order-queue'

export const useOfflineOrderQueueStore = defineStore('offlineOrderQueue', () => {
  const orders = ref<QueuedOrder[]>([])
  const isHydrated = ref(false)

  async function hydrate() {
    if (isHydrated.value) return
    orders.value = (await get<QueuedOrder[]>(STORAGE_KEY)) ?? []
    isHydrated.value = true
  }

  async function persist() {
    await set(STORAGE_KEY, orders.value)
  }

  async function enqueue(order: Omit<QueuedOrder, 'syncStatus' | 'syncError'>) {
    await hydrate()
    orders.value.push({ ...order, syncStatus: 'pending' })
    await persist()
  }

  async function markSyncing(orderId: string) {
    const order = orders.value.find((o) => o.id === orderId)
    if (order) order.syncStatus = 'syncing'
    await persist()
  }

  async function markSynced(orderId: string) {
    orders.value = orders.value.filter((o) => o.id !== orderId)
    await persist()
  }

  async function markError(orderId: string, message: string) {
    const order = orders.value.find((o) => o.id === orderId)
    if (order) {
      order.syncStatus = 'error'
      order.syncError = message
    }
    await persist()
  }

  async function clearAll() {
    orders.value = []
    await del(STORAGE_KEY)
  }

  const pendingCount = computed(() => orders.value.filter((o) => o.syncStatus !== 'syncing').length)

  return { orders, pendingCount, hydrate, enqueue, markSyncing, markSynced, markError, clearAll }
})
