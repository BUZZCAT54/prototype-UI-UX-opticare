import { cn } from '../../utils/cn'

export interface IconProps {
  name: string
  size?: number
  className?: string
  fill?: boolean
  label?: string
}

/**
 * Glyph Material Symbols Outlined (sumber asli dari screen Stitch).
 * DESIGN.md §9 juga mengizinkan Lucide — dipakai lewat `<LucideIcon>` bila
 * sebuah glyph tidak tersedia di set Material Symbols.
 */
export function Icon({ name, size = 20, className, fill = false, label }: IconProps) {
  return (
    <span
      className={cn('ms', className)}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
      }}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {name}
    </span>
  )
}
