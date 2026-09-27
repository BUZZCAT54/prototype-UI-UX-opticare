import { useEffect, useState } from 'react'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import { SORT_OPTIONS, type SortId } from './filters'

export function SortSheet({
  open,
  onClose,
  value,
  onApply,
}: {
  open: boolean
  onClose: () => void
  value: SortId
  onApply: (next: SortId) => void
}) {
  const [draft, setDraft] = useState<SortId>(value)
  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Urutkan Berdasarkan"
      footer={
        <Button fullWidth onClick={() => onApply(draft)}>
          Terapkan Urutan
        </Button>
      }
    >
      <div className="flex flex-col gap-1 py-2">
        {SORT_OPTIONS.map((opt) => {
          const active = draft === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setDraft(opt.id)}
              className={cn(
                'flex items-center justify-between rounded-xl px-3.5 py-3 text-left transition-colors',
                active ? 'bg-brand-light/60' : 'hover:bg-canvas',
              )}
            >
              <span className={cn('text-sm', active ? 'font-bold text-ink' : 'font-medium text-ink')}>
                {opt.label}
              </span>
              <span
                className={cn(
                  'grid h-5 w-5 place-items-center rounded-full border-2',
                  active ? 'border-brand' : 'border-line-input',
                )}
              >
                {active && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
              </span>
            </button>
          )
        })}
      </div>
    </BottomSheet>
  )
}
