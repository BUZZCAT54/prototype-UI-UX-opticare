import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { defaultOrders } from '../data/orders'
import type { Order } from '../types'

interface NewOrderInput {
  items: Order['items']
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  fulfilment: Order['fulfilment']
  paymentMethod: string
  address?: string
  branchId?: string
}

interface OrderContextValue {
  orders: Order[]
  get: (id: string | undefined) => Order | undefined
  create: (input: NewOrderInput) => Order
}

const OrderContext = createContext<OrderContextValue | null>(null)

export function OrderProvider({ children }: { children: ReactNode }) {
  const { value: orders, set } = useLocalStorage<Order[]>('opticare.orders', defaultOrders)

  const api = useMemo<OrderContextValue>(
    () => ({
      orders,
      get: (id) => orders.find((o) => o.id === id),
      create: (input) => {
        const now = new Date()
        const stamp = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(2)}`
        const seq = String(orders.length + 15).padStart(3, '0')
        const order: Order = {
          id: `opt-${stamp}-${seq}`,
          code: `OPT-${stamp}-${seq}`,
          createdAt: now.toISOString().slice(0, 10),
          items: input.items,
          itemCount: input.items.reduce((s, i) => s + i.qty, 0),
          subtotal: input.subtotal,
          discount: input.discount,
          shippingCost: input.shippingCost,
          total: input.total,
          status: 'confirmed',
          fulfilment: input.fulfilment,
          paymentMethod: input.paymentMethod,
          address: input.address,
          branchId: input.branchId,
          timeline: [{ status: 'confirmed', at: now.toISOString(), note: 'Pembayaran berhasil diverifikasi.' }],
        }
        set((prev) => [order, ...prev])
        return order
      },
    }),
    [orders, set],
  )

  return <OrderContext.Provider value={api}>{children}</OrderContext.Provider>
}

export function useOrders(): OrderContextValue {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders harus dipakai di dalam OrderProvider')
  return ctx
}
