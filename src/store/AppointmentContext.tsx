import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { defaultAppointments } from '../data/appointments'
import type { Appointment } from '../types'

interface NewAppointmentInput {
  branchId: string
  date: string
  time: string
  type: Appointment['type']
  optometrist?: string
  service?: Appointment['service']
  patientName?: string
  relation?: string
  phone?: string
  note?: string
}

interface AppointmentContextValue {
  appointments: Appointment[]
  get: (id: string | undefined) => Appointment | undefined
  book: (input: NewAppointmentInput) => Appointment
  reschedule: (id: string, date: string, time: string) => void
  cancel: (id: string) => void
}

const AppointmentContext = createContext<AppointmentContextValue | null>(null)

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const { value: appointments, set } = useLocalStorage<Appointment[]>(
    'opticare.appointments',
    defaultAppointments,
  )

  const api = useMemo<AppointmentContextValue>(
    () => ({
      appointments,
      get: (id) => appointments.find((a) => a.id === id),
      book: (input) => {
        const now = new Date()
        const stamp = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(2)}`
        const appt: Appointment = {
          id: `appt-${Date.now()}`,
          code: `EYE-${stamp}-${String(appointments.length + 9).padStart(3, '0')}`,
          createdAt: now.toISOString().slice(0, 10),
          status: 'upcoming',
          ...input,
        }
        set((prev) => [appt, ...prev])
        return appt
      },
      reschedule: (id, date, time) =>
        set((prev) => prev.map((a) => (a.id === id ? { ...a, date, time, status: 'upcoming' } : a))),
      cancel: (id) =>
        set((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))),
    }),
    [appointments, set],
  )

  return <AppointmentContext.Provider value={api}>{children}</AppointmentContext.Provider>
}

export function useAppointments(): AppointmentContextValue {
  const ctx = useContext(AppointmentContext)
  if (!ctx) throw new Error('useAppointments harus dipakai di dalam AppointmentProvider')
  return ctx
}
