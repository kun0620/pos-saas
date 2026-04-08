import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, addons = []) => {
    const items = get().items
    const addonKey = addons.map(a => a.id).sort().join(',') || 'none'
    const cartItemId = `${product.id}-${addonKey}`

    const existing = items.find(i => i.cartItemId === cartItemId)

    if (existing) {
      set({
        items: items.map(i =>
          i.cartItemId === cartItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      })
    } else {
      set({ items: [...items, { cartItemId, product, addons, quantity: 1 }] })
    }
  },

  updateQty: (cartItemId, delta) => {
    const items = get().items
    set({
      items: items
        .map(i => i.cartItemId === cartItemId
          ? { ...i, quantity: i.quantity + delta }
          : i
        )
        .filter(i => i.quantity > 0)
    })
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => get().items.reduce(
    (sum, i) => {
      const addonTotal = (i.addons || []).reduce((aSum, a) => aSum + Number(a.price || 0), 0)
      return sum + (i.product.price + addonTotal) * i.quantity
    }, 0
  ),
}))