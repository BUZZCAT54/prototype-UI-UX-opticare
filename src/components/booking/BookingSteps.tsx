import { Icon } from '../ui/Icon'
import { cn } from '../../utils/cn'

const STEPS = ['Jadwal', 'Lokasi', 'Konfirmasi']

/** Indikator langkah booking: 1 Jadwal · 2 Lokasi · 3 Konfirmasi. */
export function BookingSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1.5 px-5 pt-3">
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={label} className="flex flex-1 items-center gap-1.5 last:flex-none">
            <span
              className={cn(
                'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                done && 'bg-brand text-white',
                active && 'border-2 border-brand bg-brand-light text-brand',
                !done && !active && 'border border-line-input text-ink-muted',
              )}
            >
              {done ? <Icon name="check" size={13} /> : step}
            </span>
            <span
              className={cn(
                'text-xs',
                active ? 'font-bold text-ink' : done ? 'font-semibold text-ink' : 'font-medium text-ink-muted',
              )}
            >
              {label}
            </span>
            {step < 3 && <span className="h-px min-w-3 flex-1 bg-line" />}
          </div>
        )
      })}
    </div>
  )
}
