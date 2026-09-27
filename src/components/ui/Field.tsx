import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface TabItem<T extends string> {
  id: T
  label: string
  count?: number
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (id: T) => void
  className?: string
  /** Pills (filter) atau segmented control di dalam kartu. */
  variant?: 'pill' | 'segment'
}

export function Tabs<T extends string>({ items, value, onChange, className, variant = 'pill' }: TabsProps<T>) {
  if (variant === 'segment') {
    return (
      <div className={cn('flex gap-1 rounded-md bg-canvas p-1', className)} role="tablist">
        {items.map((item) => {
          const active = item.id === value
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.id)}
              className={cn(
                'h-10 flex-1 rounded-sm text-label-md transition-colors duration-150',
                active ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink',
              )}
            >
              {item.label}
              {typeof item.count === 'number' && (
                <span className={cn('ml-1', active ? 'text-brand' : 'text-ink-muted/70')}>
                  {item.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('no-scrollbar flex gap-2 overflow-x-auto', className)} role="tablist">
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'h-9 shrink-0 rounded-sm border px-4 text-[13px] font-medium transition-colors duration-150',
              active
                ? 'border-brand bg-brand-light font-semibold text-brand-dark'
                : 'border-line bg-surface text-ink-muted hover:border-brand/40 hover:text-ink',
            )}
          >
            {item.label}
            {typeof item.count === 'number' && <span className="ml-1.5 opacity-70">{item.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
  htmlFor,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
  htmlFor?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-label-md text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-body-sm text-error">{error}</span>
      ) : hint ? (
        <span className="text-body-sm text-ink-muted">{hint}</span>
      ) : null}
    </div>
  )
}

export const inputClass =
  'h-12 w-full rounded-md border border-line-input bg-surface px-4 text-body-md text-ink ' +
  'placeholder:text-ink-muted transition-colors duration-150 ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ' +
  'disabled:cursor-not-allowed disabled:bg-canvas'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(inputClass, 'h-auto min-h-[96px] py-3 leading-6', props.className)}
    />
  )
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-out-soft',
        checked ? 'bg-brand' : 'bg-line',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform duration-200 ease-out-soft',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className,
}: {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-light text-brand">
        <span className="ms" style={{ fontSize: 26 }}>
          {icon}
        </span>
      </span>
      <h3 className="text-headline-sm text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-[36ch] text-body-md text-ink-muted">{description}</p>}
      {action && <div className="mt-5 w-full max-w-[280px]">{action}</div>}
    </div>
  )
}
