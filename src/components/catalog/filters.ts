import type { FrameShape, Gender, Product } from '../../types'
import { SHAPE_LABEL } from '../../data/products'

export type SortId = 'relevan' | 'harga-terendah' | 'harga-tertinggi' | 'rating' | 'terbaru'

export const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: 'relevan', label: 'Paling Relevan' },
  { id: 'harga-terendah', label: 'Harga Terendah' },
  { id: 'harga-tertinggi', label: 'Harga Tertinggi' },
  { id: 'rating', label: 'Rating Tertinggi' },
  { id: 'terbaru', label: 'Terbaru' },
]

export interface CatalogFilters {
  gender: Gender | 'all'
  shapes: FrameShape[]
  materials: string[]
  colors: string[]
  min: number
  max: number
}

export const PRICE_MIN = 500_000
export const PRICE_MAX = 2_500_000

export const DEFAULT_FILTERS: CatalogFilters = {
  gender: 'all',
  shapes: [],
  materials: [],
  colors: [],
  min: PRICE_MIN,
  max: PRICE_MAX,
}

export interface ColorGroup {
  id: string
  label: string
  hex: string
  dashed?: boolean
  match: (colors: { name: string; hex: string }[]) => boolean
}

/** Grup warna mengikuti screen Filter Stitch: Hitam, Cokelat, Transparan, Gold, Silver. */
export const COLOR_GROUPS: ColorGroup[] = [
  {
    id: 'hitam',
    label: 'Hitam',
    hex: '#102A2A',
    match: (c) => c.some((x) => /black|noir|ink|navy|smoke|charcoal/i.test(x.name) || isDark(x.hex)),
  },
  {
    id: 'cokelat',
    label: 'Cokelat',
    hex: '#7B3F00',
    match: (c) => c.some((x) => /tortoise|havana|hazel|brown|amber|bronze|coffee/i.test(x.name)),
  },
  {
    id: 'transparan',
    label: 'Transparan',
    hex: '#FFFFFF',
    dashed: true,
    match: (c) => c.some((x) => /crystal|clear|transparent|transparan/i.test(x.name)),
  },
  {
    id: 'gold',
    label: 'Gold',
    hex: '#D4AF37',
    match: (c) => c.some((x) => /gold|honey|champagne|rose gold/i.test(x.name)),
  },
  {
    id: 'silver',
    label: 'Silver',
    hex: '#C0C0C0',
    match: (c) => c.some((x) => /silver|gunmetal|grey|gray|steel/i.test(x.name)),
  },
]

function isDark(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length !== 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.25
}

export function materialsIn(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.material))]
}

export function activeFilterCount(f: CatalogFilters): number {
  return (
    (f.gender !== 'all' ? 1 : 0) +
    f.shapes.length +
    f.materials.length +
    f.colors.length +
    (f.min !== PRICE_MIN || f.max !== PRICE_MAX ? 1 : 0)
  )
}

export function toggleIn<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export function filterProducts(all: Product[], f: CatalogFilters, query: string): Product[] {
  const q = query.trim().toLowerCase()
  return all.filter((p) => {
    if (q) {
      const hay = `${p.brand} ${p.name} ${p.material} ${p.shape}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (f.gender !== 'all' && p.gender !== f.gender && p.gender !== 'unisex') return false
    if (f.shapes.length && !f.shapes.includes(p.shape)) return false
    if (f.materials.length && !f.materials.includes(p.material)) return false
    if (f.colors.length && !f.colors.some((id) => COLOR_GROUPS.find((g) => g.id === id)?.match(p.colors)))
      return false
    if (p.price < f.min || p.price > f.max) return false
    return true
  })
}

export function sortProducts(list: Product[], sort: SortId): Product[] {
  const out = [...list]
  switch (sort) {
    case 'harga-terendah':
      return out.sort((a, b) => a.price - b.price)
    case 'harga-tertinggi':
      return out.sort((a, b) => b.price - a.price)
    case 'rating':
      return out.sort((a, b) => b.rating - a.rating)
    case 'terbaru':
      return out.reverse()
    default:
      return out
  }
}

export interface ActiveChip {
  key: string
  label: string
  remove: (f: CatalogFilters) => CatalogFilters
}

export function activeChips(f: CatalogFilters): ActiveChip[] {
  const chips: ActiveChip[] = []
  if (f.gender !== 'all')
    chips.push({
      key: 'gender',
      label: f.gender === 'pria' ? 'Pria' : f.gender === 'wanita' ? 'Wanita' : 'Unisex',
      remove: (x) => ({ ...x, gender: 'all' }),
    })
  for (const s of f.shapes)
    chips.push({
      key: `shape-${s}`,
      label: SHAPE_LABEL[s],
      remove: (x) => ({ ...x, shapes: x.shapes.filter((y) => y !== s) }),
    })
  for (const m of f.materials)
    chips.push({
      key: `mat-${m}`,
      label: m,
      remove: (x) => ({ ...x, materials: x.materials.filter((y) => y !== m) }),
    })
  for (const c of f.colors)
    chips.push({
      key: `color-${c}`,
      label: COLOR_GROUPS.find((g) => g.id === c)?.label ?? c,
      remove: (x) => ({ ...x, colors: x.colors.filter((y) => y !== c) }),
    })
  if (f.min !== PRICE_MIN || f.max !== PRICE_MAX)
    chips.push({
      key: 'price',
      label: `${formatShort(f.min)}–${formatShort(f.max)}`,
      remove: (x) => ({ ...x, min: PRICE_MIN, max: PRICE_MAX }),
    })
  return chips
}

function formatShort(v: number): string {
  if (v >= 1_000_000) {
    const n = v / 1_000_000
    return `Rp${Number.isInteger(n) ? n : n.toFixed(1).replace('.', ',')}jt`
  }
  return `Rp${Math.round(v / 1000)}k`
}
