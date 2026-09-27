import { cn } from '../../utils/cn'
import { Icon } from './Icon'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  icon?: string
  tone?: 'default' | 'danger'
}

/** Dialog konfirmasi (hapus item, logout, batal booking) — radius 16px (DESIGN.md §7). */
export function Modal({ open, onClose, title, children, footer, icon, tone = 'default' }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-5">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-overlay backdrop-blur-[2px]"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[360px] rounded-lg bg-surface p-5 shadow-elevated animate-[modal-in_200ms_var(--ease-out-soft)]"
      >
        {icon && (
          <span
            className={cn(
              'mb-3 grid h-11 w-11 place-items-center rounded-full',
              tone === 'danger' ? 'bg-error/10 text-error' : 'bg-brand-light text-brand',
            )}
          >
            <Icon name={icon} size={22} />
          </span>
        )}
        {title && <h2 className="text-headline-sm text-ink">{title}</h2>}
        <div className="mt-2 text-body-md text-ink-muted">{children}</div>
        {footer && <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">{footer}</div>}
      </div>
      <style>{`@keyframes modal-in{from{transform:scale(.97);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}
