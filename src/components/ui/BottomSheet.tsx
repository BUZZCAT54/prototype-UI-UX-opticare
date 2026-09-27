import { useEffect, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { IconButton } from './Button'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/** Bottom sheet 250ms ease-out (DESIGN.md §30) — dipakai filter, sort, promo, dll. */
export function BottomSheet({ open, onClose, title, children, footer, className }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full max-w-[430px] max-h-[85vh] overflow-hidden',
          'flex flex-col rounded-t-xl bg-surface shadow-elevated',
          'animate-[sheet-in_250ms_var(--ease-out-soft)]',
          className,
        )}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <div className="flex flex-col items-start gap-3">
            <span className="mx-auto h-1 w-10 rounded-full bg-line md:hidden" />
            {title && <h2 className="text-headline-sm text-ink">{title}</h2>}
          </div>
          <IconButton name="close" label="Tutup" onClick={onClose} size={32} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
      <style>{`@keyframes sheet-in{from{transform:translateY(24px);opacity:.4}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  )
}
