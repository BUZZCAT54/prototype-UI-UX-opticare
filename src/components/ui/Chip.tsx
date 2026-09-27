import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Icon } from './Icon'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  children: ReactNode
  removable?: boolean
  onRemove?: () => void
}

/** Chip filter kategori (Semua / Pria / Wanita / Unisex) — DESIGN.md §16. */
export function Chip({ active, children, removable, onRemove, className, ...rest }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border transition-colors duration-150',
        'h-9 px-4 text-[13px] font-medium whitespace-nowrap',
        active
          ? 'border-brand bg-brand-light text-brand-dark font-semibold'
          : 'border-line bg-surface text-ink-muted hover:border-brand/40 hover:text-ink',
        className,
      )}
    >
      <button
        type="button"
        className="inline-flex h-full items-center gap-1 whitespace-nowrap"
        aria-pressed={active}
        {...rest}
      >
        {children}
      </button>
      {removable && (
        <button
          type="button"
          aria-label="Hapus filter"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className="-mr-2 grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:text-ink"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </span>
  )
}

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error'

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  const TONE: Record<BadgeTone, string> = {
    neutral: 'bg-canvas text-ink-muted border-line',
    brand: 'bg-brand-light text-brand-dark border-brand/30',
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-[#8A5E17] border-warning/30',
    error: 'bg-error/10 text-error border-error/30',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-label-sm',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
