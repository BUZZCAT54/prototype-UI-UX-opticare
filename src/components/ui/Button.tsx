import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Icon } from './Icon'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'quiet'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leadingIcon?: string
  trailingIcon?: string
  loading?: boolean
  children?: ReactNode
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark disabled:bg-line disabled:text-ink-muted',
  secondary:
    'bg-brand-light text-brand-dark hover:bg-brand/15 active:bg-brand/15 disabled:bg-line disabled:text-ink-muted',
  outline:
    'bg-surface text-ink border border-line hover:bg-canvas active:bg-canvas disabled:text-ink-muted disabled:border-line',
  ghost: 'bg-transparent text-ink hover:bg-surface active:bg-surface disabled:text-ink-muted',
  danger: 'bg-error text-white hover:brightness-95 active:brightness-95 disabled:bg-line',
  quiet: 'bg-transparent text-brand hover:bg-brand-light active:bg-brand-light disabled:text-ink-muted',
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-label-sm rounded-sm gap-1.5',
  md: 'h-11 px-5 text-label-md rounded-md gap-2',
  lg: 'h-12 px-6 text-label-lg rounded-md gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  leadingIcon,
  trailingIcon,
  loading,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-colors duration-150 ease-out-soft',
        'min-h-11 select-none disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Icon name="autorenew" className="animate-spin" size={18} />
      ) : (
        leadingIcon && <Icon name={leadingIcon} size={18} />
      )}
      {children}
      {trailingIcon && !loading && <Icon name={trailingIcon} size={18} />}
    </button>
  )
}

/** Tombol ikon bulat 36–44px seperti top app bar Stitch (hit-area minimum 44px). */
export function IconButton({
  name,
  size = 36,
  label,
  className,
  active,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  name: string
  size?: number
  label: string
  active?: boolean
}) {
  const hit = Math.max(size, 44)
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn('inline-grid place-items-center transition-colors duration-150', className)}
      style={{ width: hit, height: hit }}
      {...rest}
    >
      <span
        className={cn(
          'grid place-items-center rounded-full transition-colors duration-150',
          'text-ink group-hover:bg-line/60',
          active ? 'text-brand bg-brand-light' : 'bg-transparent hover:bg-line/60 active:bg-line',
        )}
        style={{ width: size, height: size }}
      >
        <Icon name={name} size={Math.round(size * 0.55)} />
      </span>
    </button>
  )
}
