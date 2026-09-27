import { useEffect, useState } from 'react'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { cn } from '../../utils/cn'
import { products as allProducts, SHAPE_LABEL, GENDER_LABEL } from '../../data/products'
import type { FrameShape, Gender } from '../../types'
import {
  COLOR_GROUPS,
  DEFAULT_FILTERS,
  PRICE_MAX,
  PRICE_MIN,
  activeFilterCount,
  filterProducts,
  materialsIn,
  toggleIn,
  type CatalogFilters,
} from './filters'

const SHAPE_ICON: Record<FrameShape, string> = {
  square: 'crop_square',
  round: 'radio_button_unchecked',
  rectangle: 'rectangle',
  aviator: 'explore',
  'cat-eye': 'visibility',
  geometric: 'hexagon',
}

const ALL_SHAPES: FrameShape[] = ['square', 'round', 'rectangle', 'aviator', 'cat-eye', 'geometric']
const GENDERS: (Gender | 'all')[] = ['all', 'pria', 'wanita', 'unisex']

function SectionTitle({ children }: { children: string }) {
  return <h3 className="mb-2.5 text-sm font-bold text-ink">{children}</h3>
}

export function FilterSheet({
  open,
  onClose,
  value,
  onApply,
}: {
  open: boolean
  onClose: () => void
  value: CatalogFilters
  onApply: (next: CatalogFilters) => void
}) {
  const [draft, setDraft] = useState<CatalogFilters>(value)
  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  const materials = materialsIn(allProducts)
  const preview = filterProducts(allProducts, draft, '').length
  const count = activeFilterCount(draft)

  const set = (partial: Partial<CatalogFilters>) => setDraft((d) => ({ ...d, ...partial }))

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Filter Produk"
      className="h-[86%] max-h-[730px] rounded-t-[24px]"
      footer={
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-ink-muted">Hasil</span>
            <span className="whitespace-nowrap text-[15px] font-bold text-ink">
              {preview} Produk
            </span>
          </div>
          <Button fullWidth onClick={() => onApply(draft)}>
            Terapkan Filter
          </Button>
        </div>
      }
    >
      <div className="-mt-1 flex items-center justify-between pb-1">
        <span className="whitespace-nowrap rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand-dark">
          {count} Filter Aktif
        </span>
        <button
          type="button"
          onClick={() => setDraft({ ...DEFAULT_FILTERS })}
          className="text-sm font-medium text-ink-muted transition-colors hover:text-brand-dark"
        >
          Reset Semua
        </button>
      </div>

      <div className="flex flex-col gap-6 pt-3">
        {/* Gender */}
        <div>
          <SectionTitle>Gender &amp; Target</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => {
              const active = draft.gender === g
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => set({ gender: g })}
                  className={cn(
                    'flex h-9 items-center justify-center gap-1.5 rounded-[8px] border px-4 text-[13px] transition-colors',
                    active
                      ? 'border-brand bg-brand-light font-semibold text-brand-dark'
                      : 'border-line bg-surface font-medium text-ink-muted hover:text-ink',
                  )}
                >
                  {active && <Icon name="check" size={16} />}
                  {g === 'all' ? 'Semua' : GENDER_LABEL[g]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bentuk */}
        <div>
          <SectionTitle>Bentuk Frame</SectionTitle>
          <div className="grid grid-cols-3 gap-2.5">
            {ALL_SHAPES.map((s) => {
              const active = draft.shapes.includes(s)
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => set({ shapes: toggleIn(draft.shapes, s) })}
                  className={cn(
                    'relative flex h-[74px] flex-col items-center justify-center gap-1 rounded-[12px] border p-2 text-center transition-all',
                    active
                      ? 'border-2 border-brand bg-brand-light text-brand-dark'
                      : 'border-line bg-surface text-ink hover:border-brand/50',
                  )}
                >
                  <Icon name={SHAPE_ICON[s]} size={22} className={active ? 'text-brand-dark' : 'text-ink-muted'} />
                  <span className={cn('text-xs', active ? 'font-bold' : 'font-medium')}>
                    {SHAPE_LABEL[s]}
                  </span>
                  {active && (
                    <span className="absolute right-1 top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-brand text-white">
                      <Icon name="check" size={10} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Material */}
        <div>
          <SectionTitle>Material Frame</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {materials.map((m) => {
              const active = draft.materials.includes(m)
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => set({ materials: toggleIn(draft.materials, m) })}
                  className={cn(
                    'flex h-9 items-center justify-center gap-1.5 rounded-[8px] border px-3.5 text-[13px] transition-colors',
                    active
                      ? 'border-brand bg-brand-light font-semibold text-brand-dark'
                      : 'border-line bg-surface font-medium text-ink-muted hover:text-ink',
                  )}
                >
                  {active && <Icon name="check" size={16} />}
                  {m}
                </button>
              )
            })}
          </div>
        </div>

        {/* Warna */}
        <div>
          <SectionTitle>Warna Frame</SectionTitle>
          <div className="no-scrollbar flex gap-3 overflow-x-auto py-1">
            {COLOR_GROUPS.map((g) => {
              const active = draft.colors.includes(g.id)
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => set({ colors: toggleIn(draft.colors, g.id) })}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <span
                    className={cn(
                      'grid h-10 w-10 place-items-center rounded-full text-white transition-all',
                      active
                        ? 'ring-2 ring-offset-2 ring-brand'
                        : g.dashed
                          ? 'border-2 border-dashed border-line-input'
                          : 'border border-line',
                    )}
                    style={{ backgroundColor: g.dashed ? undefined : g.hex }}
                  >
                    {active && !g.dashed && <Icon name="check" size={18} />}
                  </span>
                  <span
                    className={cn(
                      'text-[11px]',
                      active ? 'font-bold text-brand-dark' : 'font-medium text-ink-muted',
                    )}
                  >
                    {g.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Harga */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">Kisaran Harga</h3>
            <span className="text-xs font-medium text-brand-dark">
              {short(draft.min)} – {short(draft.max)}
            </span>
          </div>
          <div className="range-slider mb-1">
            <span className="rs-track" />
            <span
              className="rs-active"
              style={{
                left: `${((draft.min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                right: `${100 - ((draft.max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
              }}
            />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={50_000}
              value={draft.min}
              aria-label="Harga minimum"
              onChange={(e) => set({ min: Math.min(Number(e.target.value), draft.max - 50_000) })}
            />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={50_000}
              value={draft.max}
              aria-label="Harga maksimum"
              onChange={(e) => set({ max: Math.max(Number(e.target.value), draft.min + 50_000) })}
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(['min', 'max'] as const).map((k) => (
              <label key={k} className="block">
                <span className="mb-1 block text-[11px] font-medium text-ink-muted">
                  {k === 'min' ? 'Minimum' : 'Maksimum'}
                </span>
                <input
                  inputMode="numeric"
                  value={draft[k].toLocaleString('id-ID')}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/\D/g, '')) || 0
                    const clamped = Math.min(Math.max(n, 0), PRICE_MAX)
                    if (k === 'min') set({ min: Math.min(clamped, draft.max - 50_000) })
                    else set({ max: Math.max(clamped, draft.min + 50_000) })
                  }}
                  className="h-[42px] w-full rounded-[10px] border border-line-input bg-canvas px-3 text-[13px] font-semibold text-ink focus:border-brand focus:outline-none"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

function short(v: number): string {
  if (v >= 1_000_000) {
    const n = v / 1_000_000
    return `Rp${Number.isInteger(n) ? n : n.toFixed(1).replace('.', ',')}jt`
  }
  return `Rp${Math.round(v / 1000)}rb`
}

