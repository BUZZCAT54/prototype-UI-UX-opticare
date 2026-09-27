import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { CheckoutState } from '../types'

const initial: CheckoutState = {
  fulfilment: 'delivery',
  addressId: 'addr-main',
  branchId: 'padang-khatib',
  shippingId: 'regular',
  paymentId: 'qris',
  promo: null,
  note: '',
}

interface CheckoutContextValue {
  state: CheckoutState
  patch: (partial: Partial<CheckoutState>) => void
  reset: () => void
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null)

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { value: state, set } = useLocalStorage<CheckoutState>('opticare.checkout', initial)

  const api = useMemo<CheckoutContextValue>(
    () => ({
      state,
      patch: (partial) => set((prev) => ({ ...prev, ...partial })),
      reset: () => set(initial),
    }),
    [state, set],
  )

  return <CheckoutContext.Provider value={api}>{children}</CheckoutContext.Provider>
}

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext)
  if (!ctx) throw new Error('useCheckout harus dipakai di dalam CheckoutProvider')
  return ctx
}
