import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { defaultPrescriptions } from '../data/prescriptions'
import type { Prescription } from '../types'

interface PrescriptionContextValue {
  list: Prescription[]
  activeId: string | null
  active: Prescription | null
  setActive: (id: string | null) => void
  save: (rx: Omit<Prescription, 'id'> & { id?: string }) => Prescription
  remove: (id: string) => void
}

const PrescriptionContext = createContext<PrescriptionContextValue | null>(null)

export function PrescriptionProvider({ children }: { children: ReactNode }) {
  const stored = useLocalStorage<Prescription[]>('opticare.prescriptions', defaultPrescriptions)
  const active = useLocalStorage<string | null>('opticare.prescription.active', defaultPrescriptions[0]?.id ?? null)

  const api = useMemo<PrescriptionContextValue>(() => {
    const list = stored.value
    return {      list,
      activeId: active.value,
      active: list.find((r) => r.id === active.value) ?? list[0] ?? null,
      setActive: active.set,
      save: (rx) => {
        const id = rx.id ?? `rx-${Date.now()}`
        const record: Prescription = {
          ...rx,
          id,
          createdAt: rx.createdAt || new Date().toISOString().slice(0, 10),
        }
        stored.set((prev) => {
          const exists = prev.some((r) => r.id === id)
          return exists ? prev.map((r) => (r.id === id ? record : r)) : [record, ...prev]
        })
        active.set(id)
        return record
      },
      remove: (id) => {
        stored.set((prev) => prev.filter((r) => r.id !== id))
        active.set((prev) => (prev === id ? null : prev))
      },
    }
  }, [stored.value, stored.set, active.value, active.set])

  return <PrescriptionContext.Provider value={api}>{children}</PrescriptionContext.Provider>
}

export function usePrescriptions(): PrescriptionContextValue {
  const ctx = useContext(PrescriptionContext)
  if (!ctx) throw new Error('usePrescriptions harus dipakai di dalam PrescriptionProvider')
  return ctx
}
