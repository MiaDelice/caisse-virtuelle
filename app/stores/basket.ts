export interface BasketLine {
  itemId: number
  name: string
  unitPrice: number
  quantity: number
}

export const useBasketStore = defineStore('basket', () => {
  const lines = ref<BasketLine[]>([])

  const total = computed(() =>
    lines.value.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  )

  function addItem(item: { id: number; name: string; price: number }) {
    const existing = lines.value.find((line) => line.itemId === item.id)

    if (existing) {
      existing.quantity += 1
      return
    }

    lines.value.push({ itemId: item.id, name: item.name, unitPrice: item.price, quantity: 1 })
  }

  function increment(itemId: number) {
    const line = lines.value.find((l) => l.itemId === itemId)
    if (line) line.quantity += 1
  }

  function decrement(itemId: number) {
    const line = lines.value.find((l) => l.itemId === itemId)
    if (!line) return

    if (line.quantity <= 1) {
      removeItem(itemId)
      return
    }

    line.quantity -= 1
  }

  function removeItem(itemId: number) {
    lines.value = lines.value.filter((line) => line.itemId !== itemId)
  }

  function clear() {
    lines.value = []
  }

  return { lines, total, addItem, increment, decrement, removeItem, clear }
})
