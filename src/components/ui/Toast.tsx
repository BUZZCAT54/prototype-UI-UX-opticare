import { useToast } from '../../store/ToastContext'
import { Icon } from './Icon'

const TONE = {
  success: { icon: 'check_circle', className: 'text-success' },
  error: { icon: 'error', className: 'text-error' },
  info: { icon: 'info', className: 'text-brand' },
} as const

export function ToastHost() {
  const { toasts, dismiss } = useToast()
  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-5">
      {toasts.map((t) => {
        const tone = TONE[t.tone]
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto flex max-w-[360px] items-center gap-2 rounded-md border border-line bg-surface px-4 py-3 text-left text-body-md text-ink shadow-elevated"
          >
            <span className={tone.className}>
              <Icon name={tone.icon} size={18} />
            </span>
            <span>{t.message}</span>
          </button>
        )
      })}
    </div>
  )
}
