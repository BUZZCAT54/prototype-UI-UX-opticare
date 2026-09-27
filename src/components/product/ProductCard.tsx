import { useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { formatRupiah } from '../../utils/format'
import { useFavorites } from '../../store/FavoritesContext'
import { Icon } from '../ui/Icon'
import type { Product } from '../../types'

export type ProductCardVariant = 'grid' | 'home'

function FavoriteButton({
  id,
  className,
  size,
}: {
  id: string
  className?: string
  size?: number
}) {
  const { has, toggle } = useFavorites()
  const active = has(id)
  return (
    <button
      type="button"
      aria-label={active ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation()
        toggle(id)
      }}
      className={cn(
        'absolute z-10 grid place-items-center rounded-full bg-surface/90 backdrop-blur-sm border border-line text-ink-muted transition-colors',
        active ? 'text-error hover:text-error' : 'hover:text-brand',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon name="favorite" size={Math.round((size ?? 26) * 0.6)} fill={active} />
    </button>
  )
}

function Price({ product, className }: { product: Product; className?: string }) {
  return <span className={cn('font-bold text-brand', className)}>{formatRupiah(product.price)}</span>
}

/** Card produk — desain mengikuti grid Catalog (DESIGN.md §16) dan Home. */
export function ProductCard({
  product,
  variant = 'grid',
  className,
}: {
  product: Product
  variant?: ProductCardVariant
  className?: string
}) {
  const navigate = useNavigate()
  const go = () => navigate(`/product/${product.id}`)

  if (variant === 'home') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={go}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            go()
          }
        }}
        className={cn(
          'relative flex cursor-pointer flex-col justify-between rounded-2xl border border-line bg-surface p-2.5 text-left shadow-card',
          'transition-transform active:scale-[0.98] hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-brand',
          className,
        )}
      >
        <FavoriteButton id={product.id} className="right-2.5 top-2.5" size={28} />
        <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-canvas p-2">
          <img
            src={product.images[0]}
            alt={`${product.brand} ${product.name}`}
            loading="lazy"
            className="h-full w-full object-contain mix-blend-multiply"
          />
        </div>
        <div className="px-1 pt-2">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            {product.brand}
          </span>
          <h4 className="mt-0.5 truncate text-[13px] font-bold text-ink">{product.name}</h4>
          <span className="mt-0.5 block truncate text-[11px] text-ink-muted">
            {product.material} • {product.gender === 'unisex' ? 'Unisex' : product.gender}
          </span>
          <div className="mt-2 flex items-center justify-between border-t border-line/70 pt-1">
            <Price product={product} className="text-[13px]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          go()
        }
      }}
      className={cn(
        'relative flex cursor-pointer flex-col justify-between rounded-2xl border border-line bg-surface p-3 text-left shadow-sm',
        'transition-transform active:scale-[0.98] hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-brand',
        className,
      )}
    >
      <FavoriteButton id={product.id} className="right-1.5 top-1.5" size={24} />
      <div>
        <div className="relative mb-2.5 flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-[10px] bg-canvas">
          <img
            src={product.images[0]}
            alt={`${product.brand} ${product.name}`}
            loading="lazy"
            className="h-full w-full object-contain p-2"
          />
        </div>
        <p className="mb-0.5 truncate text-xs font-medium leading-tight text-ink-muted">
          {product.brand}
        </p>
        <h3 className="mb-1 truncate text-[15px] font-semibold leading-snug text-ink">
          {product.name}
        </h3>
        <p className="mb-2 text-sm font-semibold text-ink">{formatRupiah(product.price)}</p>
      </div>
      <div className="flex items-center justify-between border-t border-line pt-2 text-[11px] text-ink-muted">
        <span>{product.colors.length} warna</span>
        <span className="flex items-center gap-0.5 font-semibold text-amber-500">
          <Icon name="star" size={13} fill />
          {product.rating.toFixed(1)}
        </span>
      </div>
    </div>
  )
}
