import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useCart } from '../../store/CartContext'
import { cn } from '../../utils/cn'
import { IconButton } from '../ui/Button'

interface PageHeaderProps {
  title?: string
  subtitle?: string
  variant?: 'back' | 'brand' | 'plain'
  onBack?: () => void
  actions?: ReactNode
  showCart?: boolean
  showNotification?: boolean
  className?: string
  /** Konten custom menggantikan title (mis. greeting Home). */
  children?: ReactNode
  /** Penanda langkah (mis. 2 dari 3) seperti screen booking Stitch. */
  step?: { current: number; total: number; label?: string }
  /** Warna latar header: canvas (Home/Katalog) atau surface (flow checkout). */
  tone?: 'canvas' | 'surface'
}

function BrandMark() {
  return (
    <span className="flex items-center gap-2">
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden className="text-brand">
        <circle cx="7.2" cy="13.5" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.8" cy="13.5" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M11.4 13.2c.4-.7 1.2-.7 1.6 0M3 11.6c1.3-2.6 3-3.9 4.6-3.9M21 11.6c-1.3-2.6-3-3.9-4.6-3.9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-headline-sm tracking-tight text-ink">OptiCare</span>
    </span>
  )
}

/** Top app bar sticky — mengikuti header setiap screen Stitch. */
export function PageHeader({
  title,
  subtitle,
  variant = 'back',
  onBack,
  actions,
  showCart,
  showNotification,
  className,
  children,
  step,
  tone = 'canvas',
}: PageHeaderProps) {
  const navigate = useNavigate()
  const { count } = useCart()
  const showBack = variant === 'back'

  return (
    <header
      className={cn(
        'sticky top-0 z-30 backdrop-blur-md',
        tone === 'surface' ? 'border-b border-line/50 bg-surface/95' : 'border-b border-transparent bg-canvas/95',
        'flex min-h-14 items-center gap-1 px-3 py-2',
        className,
      )}
    >
      {variant === 'brand' && <BrandMark />}
      {showBack && (
        <IconButton
          name="arrow_back"
          label="Kembali"
          onClick={() => (onBack ? onBack() : navigate(-1))}
        />
      )}

      <div
        className={cn(
          'min-w-0 flex-1',
          variant === 'brand' ? 'pl-3' : 'px-1',
          step && 'text-center',
        )}
      >
        {step ? (
          <>
            <h1 className="truncate text-[18px] font-semibold leading-6 tracking-tight text-ink">
              {title}
            </h1>
            <div className="mt-0.5 flex items-center justify-center gap-1.5">
              {Array.from({ length: step.total }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    i < step.current ? 'bg-brand' : 'bg-line',
                  )}
                />
              ))}
              <span className="ml-1 text-xs font-medium text-ink-muted">
                {step.label ?? `Langkah ${step.current} dari ${step.total}`}
              </span>
            </div>
          </>
        ) : (
          children ??
          (title && (
            <>
              <h1 className="truncate text-[22px] font-bold leading-7 tracking-tight text-ink">
                {title}
              </h1>
              {subtitle && <p className="truncate text-body-sm text-ink-muted">{subtitle}</p>}
            </>
          ))
        )}
      </div>

      <div className="flex items-center gap-0.5">
        {actions}
        {showNotification && (
          <span className="relative">
            <IconButton
              name="notifications"
              label="Notifikasi"
              size={40}
              className="rounded-full border border-line bg-surface shadow-card"
              onClick={() => navigate('/profile/notifications')}
            />
            <span className="pointer-events-none absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand ring-2 ring-surface" />
          </span>
        )}
        {showCart && (
          <span className="relative">
            <IconButton
              name="shopping_bag"
              label="Keranjang"
              size={40}
              className="rounded-full border border-line bg-surface shadow-card"
              onClick={() => navigate('/cart')}
            />
            {count > 0 && (
              <span className="pointer-events-none absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </span>
        )}
      </div>
    </header>
  )
}

export function Section({
  title,
  action,
  children,
  className,
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 px-5">
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          {action}
        </div>
      )}
      <div className="px-5">{children}</div>
    </section>
  )
}

/** CTA sticky di bawah (DESIGN.md §17 sticky bottom CTA). */
export function StickyBar({
  children,
  aboveNav = false,
  className,
}: {
  children: ReactNode
  aboveNav?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[520px] border-t border-line',
        'bg-surface/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md shadow-nav md:max-w-3xl lg:max-w-4xl',
        aboveNav && 'bottom-[72px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-canvas md:max-w-3xl lg:max-w-4xl">
        {children}
      </div>
    </div>
  )
}
