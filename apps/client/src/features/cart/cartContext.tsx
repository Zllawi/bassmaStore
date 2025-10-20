import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = { id: string; name: string; price: number; qty: number; image?: string }
type CartState = { items: CartItem[]; drawerOpen: boolean }
type CartCtx = {
  items: CartItem[]
  total: number
  totalQty: number
  drawerOpen: boolean
  toggleDrawer: () => void
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void
  inc: (id: string) => void
  dec: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

const KEY = 'cart-state'

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(() => {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { items: [], drawerOpen: false }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const api: CartCtx = useMemo(() => {
    const addItem: CartCtx['addItem'] = (item) => setState(s => {
      const exist = s.items.find(i => i.id === item.id)
      if (exist) {
        return { ...s, items: s.items.map(i => i.id === item.id ? { ...i, qty: i.qty + (item.qty ?? 1) } : i) }
      }
      return { ...s, items: [...s.items, { ...item, qty: item.qty ?? 1 }] }
    })
    const inc: CartCtx['inc'] = (id) => setState(s => ({ ...s, items: s.items.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i) }))
    const dec: CartCtx['dec'] = (id) => setState(s => ({ ...s, items: s.items.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i) }))
    const remove: CartCtx['remove'] = (id) => setState(s => ({ ...s, items: s.items.filter(i => i.id !== id) }))
    const clear: CartCtx['clear'] = () => setState(s => ({ ...s, items: [] }))
    const toggleDrawer = () => setState(s => ({ ...s, drawerOpen: !s.drawerOpen }))
    const total = state.items.reduce((a, b) => a + b.price * b.qty, 0)
    const totalQty = state.items.reduce((a, b) => a + b.qty, 0)
    return {
      items: state.items,
      drawerOpen: state.drawerOpen,
      toggleDrawer,
      addItem,
      inc,
      dec,
      remove,
      clear,
      total,
      totalQty
    }
  }, [state])

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCartCtx() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartCtx must be used within CartProvider')
  return ctx
}
