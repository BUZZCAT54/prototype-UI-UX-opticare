import { useLocation } from 'react-router-dom'
import { BottomNav } from '../components/navigation/BottomNav'
import { PageHeader } from '../components/layout/Layout'
import { EmptyState } from '../components/ui/Field'
import { ToastHost } from '../components/ui/Toast'

const TAB_ROUTES = ['/', '/catalog', '/appointments', '/orders', '/profile']

export function Stub({ title, note }: { title: string; note?: string }) {
  const { pathname } = useLocation()
  const isTab = TAB_ROUTES.includes(pathname)

  return (
    <>
      <PageHeader
        title={isTab ? undefined : title}
        variant={isTab ? 'brand' : 'back'}
        showCart={pathname === '/'}
        showNotification={pathname === '/'}
      >
        {isTab && <span className="sr-only">{title}</span>}
      </PageHeader>
      <main className="flex-1 pb-28">
        <EmptyState
          icon="construction"
          title={title}
          description={note ?? 'Halaman ini sedang disiapkan pada phase berikutnya.'}
        />
      </main>
      <BottomNav />
      <ToastHost />
    </>
  )
}
