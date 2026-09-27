import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { defaultProfile } from '../data/profile'

export interface BookingDraft {
  service: 'basic' | 'full'
  date: string
  time: string
  branchId: string
  forSelf: boolean
  patientName: string
  phone: string
  note: string
}

const initial: BookingDraft = {
  service: 'basic',
  date: '',
  time: '',
  branchId: 'padang-khatib',
  forSelf: true,
  patientName: defaultProfile.name,
  phone: '+62 812-3456-7890',
  note: '',
}

interface BookingContextValue {
  draft: BookingDraft
  patch: (partial: Partial<BookingDraft>) => void
  reset: () => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const { value: draft, set } = useLocalStorage<BookingDraft>('opticare.booking', initial)

  const api = useMemo<BookingContextValue>(
    () => ({
      draft,
      patch: (partial) => set((prev) => ({ ...prev, ...partial })),
      reset: () => set(initial),
    }),
    [draft, set],
  )

  return <BookingContext.Provider value={api}>{children}</BookingContext.Provider>
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking harus dipakai di dalam BookingProvider')
  return ctx
}
