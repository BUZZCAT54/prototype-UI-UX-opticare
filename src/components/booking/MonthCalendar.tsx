import { useState } from 'react'
import { Icon } from '../ui/Icon'
import { cn } from '../../utils/cn'
import { toISODate } from '../../utils/format'

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const MONTH_LABEL = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })

/** Kalender bulanan (Senin pertama) untuk memilih tanggal booking. */
export function MonthCalendar({
  value,
  onChange,
  minDate,
}: {
  value: string
  onChange: (iso: string) => void
  minDate?: string
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

  const today = toISODate(new Date())
  const min = minDate ?? today
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays = new Date(year, month, 0).getDate()

  const cells: { label: number; iso: string; outside: boolean }[] = []
  for (let i = 0; i < firstWeekday; i++) {
    const day = prevDays - firstWeekday + 1 + i
    const d = new Date(year, month - 1, day)
    cells.push({ label: day, iso: toISODate(d), outside: true })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ label: day, iso: toISODate(new Date(year, month, day)), outside: false })
  }
  while (cells.length % 7 !== 0) {
    const day = cells.length - (firstWeekday + daysInMonth) + 1
    cells.push({ label: day, iso: toISODate(new Date(year, month + 1, day)), outside: true })
  }

  const prevMonth = () => setCursor(new Date(year, month - 1, 1))
  const nextMonth = () => setCursor(new Date(year, month + 1, 1))

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
          <Icon name="calendar_month" size={18} className="text-brand" />
          {MONTH_LABEL.format(cursor)}
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Bulan sebelumnya"
            onClick={prevMonth}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-brand-light hover:text-brand"
          >
            <Icon name="chevron_left" size={18} />
          </button>
          <button
            type="button"
            aria-label="Bulan berikutnya"
            onClick={nextMonth}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-brand-light hover:text-brand"
          >
            <Icon name="chevron_right" size={18} />
          </button>
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1 text-[11px] font-semibold text-ink-muted">
            {day}
          </span>
        ))}
        {cells.map((cell) => {
          const disabled = cell.outside || cell.iso < min
          const selected = cell.iso === value && !disabled
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(cell.iso)}
              className={cn(
                'grid h-9 place-items-center rounded-lg text-xs transition-colors',
                disabled && 'cursor-not-allowed text-line-input',
                !disabled && !selected && 'font-medium text-ink hover:bg-brand-light',
                selected && 'bg-brand font-bold text-white',
              )}
            >
              {cell.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
