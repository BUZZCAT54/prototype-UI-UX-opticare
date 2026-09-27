import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { CartItem, LensTypeId } from '../types'

export interface AddToCartInput {
  productId: string
  brand: string
  name: string
  image: string
  colorId: string
  colorName: string
  price: number
  lensId: LensTypeId | null
  lensName: string | null
  lensPrice: number
  qty?: number
}

interface CartContextValue {
  items: CartItem[]
  count: number
  subtotal: number
  lensTotal: number
  total: number
  add: (input: AddToCartInput) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  setLens: (id: string, lensId: LensTypeId | null, lensName: string | null, lensPrice: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { value: items, set } = useLocalStorage<CartItem[]>('opticare.cart', [])

  const api = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0)
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    const lensTotal = items.reduce((sum, i) => sum + i.lensPrice * i.qty, 0)

    return {
      items,
      count,
      subtotal,
      lensTotal,
      total: subtotal + lensTotal,
      add: (input) =>
        set((prev) => {
          const key = `${input.productId}:${input.colorId}:${input.lensId ?? 'none'}`
          const existing = prev.find((i) => i.id === key)
          if (existing) {
            return prev.map((i) => (i.id === key ? { ...i, qty: i.qty + (input.qty ?? 1) } : i))
          }
          return [
            ...prev,
            {
              id: key,
              productId: input.productId,
              brand: input.brand,
              name: input.name,
              image: input.image,
              colorId: input.colorId,
              colorName: input.colorName,
              lensId: input.lensId,
              lensName: input.lensName,
              lensPrice: input.lensPrice,
              qty: input.qty ?? 1,
              price: input.price,
            },
          ]
        }),
      setQty: (id, qty) =>
        set((prev) =>
          qty <= 0
            ? prev.filter((i) => i.id !== id)
            : prev.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, 10) } : i)),
        ),
      remove: (id) => set((prev) => prev.filter((i) => i.id !== id)),
      setLens: (id, lensId, lensName, lensPrice) =>
        set((prev) =>
          prev.map((i) => (i.id === id ? { ...i, lensId, lensName, lensPrice } : i)),
        ),
      clear: () => set([]),
    }
  }, [items, set])

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider')
  return ctx
}
