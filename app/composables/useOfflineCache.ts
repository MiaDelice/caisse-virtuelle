import { get, set } from 'idb-keyval'

const ITEMS_CACHE_KEY = 'offline-cache-items'
const EVENTS_CACHE_KEY = 'offline-cache-events'
const EVENT_ITEMS_CACHE_KEY = 'offline-cache-event-items'
const USER_ID_CACHE_KEY = 'offline-cache-user-id'

export async function cacheItems(items: unknown) {
  await set(ITEMS_CACHE_KEY, items)
}

export async function getCachedItems<T>() {
  return (await get<T>(ITEMS_CACHE_KEY)) ?? null
}

export async function cacheEvents(events: unknown) {
  await set(EVENTS_CACHE_KEY, events)
}

export async function getCachedEvents<T>() {
  return (await get<T>(EVENTS_CACHE_KEY)) ?? null
}

export async function cacheEventItems(eventId: number, itemIds: number[]) {
  const all = (await get<Record<number, number[]>>(EVENT_ITEMS_CACHE_KEY)) ?? {}
  all[eventId] = itemIds
  await set(EVENT_ITEMS_CACHE_KEY, all)
}

export async function getCachedEventItems(eventId: number): Promise<number[] | null> {
  const all = await get<Record<number, number[]>>(EVENT_ITEMS_CACHE_KEY)
  return all?.[eventId] ?? null
}

// Cache par auth_user_id : plusieurs comptes peuvent se succéder sur le même
// appareil (ex: tablette partagée entre vendeuses).
export async function cacheUserId(authUserId: string, userId: number) {
  const all = (await get<Record<string, number>>(USER_ID_CACHE_KEY)) ?? {}
  all[authUserId] = userId
  await set(USER_ID_CACHE_KEY, all)
}

export async function getCachedUserId(authUserId: string): Promise<number | null> {
  const all = await get<Record<string, number>>(USER_ID_CACHE_KEY)
  return all?.[authUserId] ?? null
}
