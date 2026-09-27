import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { defaultNotifications, defaultProfile } from '../data/profile'
import type { NotificationSetting, Profile } from '../types'

interface ProfileContextValue {
  profile: Profile
  notifications: NotificationSetting[]
  updateProfile: (partial: Partial<Profile>) => void
  toggleNotification: (id: string) => void
  logout: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const stored = useLocalStorage<Profile>('opticare.profile', defaultProfile)
  const settings = useLocalStorage<NotificationSetting[]>(
    'opticare.notifications',
    defaultNotifications,
  )

  const api = useMemo<ProfileContextValue>(
    () => ({
      profile: stored.value,
      notifications: settings.value,
      updateProfile: (partial) => stored.set((prev) => ({ ...prev, ...partial })),
      toggleNotification: (id) =>
        settings.set((prev) =>
          prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)),
        ),
      logout: () => {
        stored.set(defaultProfile)
      },
    }),
    [stored.value, stored.set, settings.value, settings.set],
  )

  return <ProfileContext.Provider value={api}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile harus dipakai di dalam ProfileProvider')
  return ctx
}
