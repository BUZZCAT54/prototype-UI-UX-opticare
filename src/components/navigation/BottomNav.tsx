import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { Icon } from '../ui/Icon'

const TABS = [
  { to: '/', label: 'Home', icon: 'home', match: (p: string) => p === '/' },
  { to: '/catalog', label: 'Catalog', icon: 'visibility', match: (p: string) => p.startsWith('/catalog') || p.startsWith('/product') },
  { to: '/appointments', label: 'Appointment', icon: 'calendar_month', match: (p: string) => p.startsWith('/appointments') || p.startsWith('/booking') },
  { to: '/orders', label: 'Orders', icon: 'receipt_long', match: (p: string) => p.startsWith('/orders') || p.startsWith('/tracking') },
  { to: '/profile', label: 'Profile', icon: 'person', match: (p: string) => p.startsWith('/profile') },
]

/** Bottom nav 5 item sesuai DESIGN.md §13. */
export function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  // Sembunyikan pada flow yang punya sticky CTA utama.
  const hidden = [
    /^\/appointments\/.+/,
    '/cart',
    '/checkout',
    '/payment',
    '/booking',
    '/lens-selection',
    '/prescription',
    '/product',
    '/profile/edit',
    /^\/profile\/prescriptions\/.+/,
  ].some((p) => (typeof p === 'string' ? pathname.startsWith(p) : p.test(pathname)))
  if (hidden) return null

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md shadow-nav"
    >
      <div className="mx-auto grid w-full max-w-[520px] grid-cols-5 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 md:max-w-3xl lg:max-w-4xl">
        {TABS.map((tab) => {
          const active = tab.match(pathname)
          return (
            <button
              key={tab.to}
              type="button"
              onClick={() => navigate(tab.to)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-[54px] flex-col items-center justify-center gap-0.5 rounded-md transition-colors duration-150',
                active ? 'text-brand' : 'text-ink-muted hover:text-ink',
              )}
            >
              <span className="relative">
                <Icon name={tab.icon} size={22} fill={active} />
              </span>
              <span className={cn('text-[11px]', active ? 'font-semibold' : 'font-medium')}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
