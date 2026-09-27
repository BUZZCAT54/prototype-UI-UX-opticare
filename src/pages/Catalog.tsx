import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { ProductCard } from '../components/product/ProductCard'
import { FilterSheet } from '../components/catalog/FilterSheet'
import { SortSheet } from '../components/catalog/SortSheet'
import {
  DEFAULT_FILTERS,
  activeChips,
  activeFilterCount,
  filterProducts,
  sortProducts,
  type CatalogFilters,
  type SortId,
} from '../components/catalog/filters'
import { Button, IconButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Skeleton } from '../components/ui/Skeleton'
import { ToastHost } from '../components/ui/Toast'
import { GENDER_LABEL, products } from '../data/products'
import type { Gender } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { cn } from '../utils/cn'

const GENDER_CHIPS: (Gender | 'all')[] = ['all', 'pria', 'wanita', 'unisex']
const POPULAR = ['Ray-Ban', 'Oakley', 'Cat-Eye', 'Titanium']
const POPULAR_SEARCH = ['Frame Kacamata Bulat', 'Anti Radiasi', 'Wayfarer Classic', 'Titanium Ringan']
const CATEGORY_LINKS = ['Frame Pria', 'Frame Wanita']

type Status = 'loading' | 'ready' | 'error'

export function Catalog() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const [focused, setFocused] = useState(false)
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortId>('relevan')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [status, setStatus] = useState<Status>('loading')
  const { value: recent, set: setRecent } = useLocalStorage<string[]>('opticare.recentSearches', [
    'Ray-Ban',
    'Oakley',
    'Round',
    'Titanium',
  ])
  const inputRef = useRef<HTMLInputElement>(null)

  const forceError = params.get('state') === 'error'

  function load() {
    setStatus('loading')
    window.setTimeout(() => setStatus(forceError ? 'error' : 'ready'), 650)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const results = useMemo(
    () => sortProducts(filterProducts(products, filters, query), sort),
    [filters, query, sort],
  )

  const chips = activeChips(filters)
  const filterCount = activeFilterCount(filters)

  function runSearch(value: string) {
    const v = value.trim()
    setQuery(v)
    setFocused(false)
    inputRef.current?.blur()
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (v) next.set('q', v)
      else next.delete('q')
      next.delete('state')
      return next
    })
    if (v) setRecent((prev) => [v, ...prev.filter((x) => x !== v)].slice(0, 6))
    load()
  }

  const showSuggestions = focused && query.trim() === ''

  return (
    <>
      <PageHeader
        title="Katalog Frame"
        variant="plain"
        showCart
        actions={
          <IconButton
            name="search"
            label="Cari"
            active={focused}
            onClick={() => {
              inputRef.current?.focus()
              setFocused(true)
            }}
          />
        }
      />

      <main className="flex-1 overflow-y-auto px-5 pb-24 pt-3 no-scrollbar">
        {/* Search */}
        <div className="relative flex items-center">
          <Icon name="search" size={20} className="pointer-events-none absolute left-3.5 text-ink-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch(query)
              if (e.key === 'Escape') setFocused(false)
            }}
            placeholder="Cari frame atau brand..."
            aria-label="Cari frame atau brand"
            className="h-12 w-full rounded-[12px] border border-line-input bg-surface pl-10 pr-10 text-sm text-ink transition-all placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {query && (
            <button
              type="button"
              aria-label="Hapus pencarian"
              onClick={() => {
                setQuery('')
                runSearch('')
              }}
              className="absolute right-3.5 flex items-center justify-center text-ink-muted hover:text-ink"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>

        {showSuggestions ? (
          <SearchSuggestions
            recent={recent}
            onPick={(v) => runSearch(v)}
            onRemoveRecent={(v) => setRecent((prev) => prev.filter((x) => x !== v))}
            onClearRecent={() => setRecent([])}
          />
        ) : (
          <div className="flex flex-col gap-3.5 pt-3">
            {/* Gender chips */}
            <div className="no-scrollbar -mx-0 flex gap-2 overflow-x-auto py-0.5">
              {GENDER_CHIPS.map((g) => {
                const active = filters.gender === g
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, gender: g }))}
                    className={cn(
                      'flex h-9 shrink-0 items-center justify-center rounded-[8px] border px-4 text-[13px] transition-colors',
                      active
                        ? 'border-brand bg-brand-light font-semibold text-brand-dark'
                        : 'border-line bg-surface font-medium text-ink-muted hover:text-ink',
                    )}
                  >
                    {g === 'all' ? 'Semua' : GENDER_LABEL[g]}
                  </button>
                )
              })}
            </div>

            {/* Filter + sort bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className={cn(
                    'flex h-[34px] items-center gap-1.5 rounded-[8px] border px-3 text-xs font-semibold shadow-sm transition-colors',
                    filterCount > 0
                      ? 'border-brand bg-brand-light text-brand-dark'
                      : 'border-line bg-surface text-ink hover:border-brand',
                  )}
                >
                  <Icon name="tune" size={16} className={filterCount ? 'text-brand-dark' : 'text-ink-muted'} />
                  <span>Filter</span>
                  {filterCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold leading-none text-white">
                      {filterCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSortOpen(true)}
                  className={cn(
                    'flex h-[34px] items-center gap-1 rounded-[8px] border px-3 text-xs font-semibold shadow-sm transition-colors',
                    sortOpen
                      ? 'border-brand bg-brand-light text-brand-dark'
                      : 'border-line bg-surface text-ink hover:border-brand',
                  )}
                >
                  <Icon name="sort" size={16} className="text-ink-muted" />
                  <span>Urutkan</span>
                  <Icon name="keyboard_arrow_down" size={16} className="text-ink-muted" />
                </button>
              </div>
              <span className="text-[13px] font-medium text-ink-muted">
                {status === 'ready' ? `${results.length} Frame` : 'Memuat...'}
              </span>
            </div>

            {/* Applied chips */}
            {chips.length > 0 && (
              <div className="-mt-1 flex flex-wrap items-center gap-1.5">
                {chips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1 rounded-[6px] border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-ink"
                  >
                    {chip.label}
                    <button
                      type="button"
                      aria-label={`Hapus filter ${chip.label}`}
                      onClick={() => setFilters((f) => chip.remove(f))}
                      className="flex items-center text-ink-muted hover:text-ink"
                    >
                      <Icon name="close" size={13} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="px-1 py-1 text-[11px] font-semibold text-brand hover:text-brand-dark"
                >
                  Hapus Semua
                </button>
              </div>
            )}

            {/* Body */}
            {status === 'loading' && <LoadingGrid />}
            {status === 'error' && (
              <div className="mt-2 flex flex-col items-center rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
                <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-error-light text-error">
                  <Icon name="cloud_off" size={28} />
                </div>
                <h2 className="text-[18px] font-semibold text-ink">Gagal memuat produk</h2>
                <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-ink-muted">
                  Koneksi bermasalah saat mengambil katalog. Coba muat ulang halaman ini.
                </p>
                <Button className="mt-5 w-full rounded-[12px]" onClick={load} leadingIcon="refresh">
                  Coba Lagi
                </Button>
              </div>
            )}
            {status === 'ready' &&
              (results.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {results.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="mt-2 flex flex-col items-center rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
                  <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-brand-light text-brand">
                    <Icon name="search_off" size={28} />
                  </div>
                  <h2 className="text-[18px] font-semibold leading-snug text-ink">
                    Tidak ada frame yang ditemukan
                  </h2>
                  <p className="mb-6 mt-2 max-w-[280px] text-sm leading-relaxed text-ink-muted">
                    Kami tidak dapat menemukan hasil yang cocok dengan pencarian atau filter
                    aktifmu. Coba periksa ejaan atau ubah kata kunci pencarian.
                  </p>
                  <div className="flex w-full flex-col gap-2.5">
                    <Button
                      className="rounded-[12px]"
                      onClick={() => {
                        setFilters(DEFAULT_FILTERS)
                        runSearch('')
                      }}
                    >
                      Hapus Filter
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-[12px]"
                      onClick={() => {
                        setQuery('')
                        inputRef.current?.focus()
                      }}
                    >
                      Coba Kata Kunci Lain
                    </Button>
                  </div>
                </div>
              ))}

            {status === 'ready' && results.length === 0 && (
              <div className="pt-2">
                <p className="mb-2.5 text-xs font-semibold text-ink-muted">Pencarian Populer</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => runSearch(k)}
                      className="flex h-8 items-center gap-1 rounded-[8px] border border-line bg-surface px-3 text-xs font-medium text-ink shadow-sm transition-colors hover:border-brand hover:text-brand"
                    >
                      <Icon name="trending_up" size={14} className="text-ink-muted" />
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters}
        onApply={(next) => {
          setFilters(next)
          setFilterOpen(false)
          load()
        }}
      />
      <SortSheet
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        value={sort}
        onApply={(next) => {
          setSort(next)
          setSortOpen(false)
        }}
      />

      <BottomNav />
      <ToastHost />
    </>
  )
}

function LoadingGrid() {
  return (
    <div className="pt-1">
      <p className="mb-3 text-[13px] font-medium text-ink-muted">Memuat produk...</p>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-surface p-3 shadow-sm">
            <Skeleton className="mb-2.5 aspect-4/3 w-full rounded-[10px]" />
            <Skeleton className="mb-1.5 h-3 w-16" />
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="mb-3 h-3.5 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SearchSuggestions({
  recent,
  onPick,
  onRemoveRecent,
  onClearRecent,
}: {
  recent: string[]
  onPick: (v: string) => void
  onRemoveRecent: (v: string) => void
  onClearRecent: () => void
}) {
  return (
    <div className="flex flex-col gap-5 pt-5">
      {recent.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-muted">Pencarian Terakhir</p>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClearRecent}
              className="text-[11px] font-semibold text-brand hover:text-brand-dark"
            >
              Hapus Semua
            </button>
          </div>
          <div className="flex flex-col">
            {recent.map((r) => (
              <div key={r} className="flex items-center justify-between py-2">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPick(r)}
                  className="flex items-center gap-3 text-sm font-medium text-ink"
                >
                  <Icon name="schedule" size={18} className="text-ink-muted" />
                  {r}
                </button>
                <button
                  type="button"
                  aria-label={`Hapus ${r}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onRemoveRecent(r)}
                  className="grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:text-ink"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2.5 text-xs font-semibold text-ink-muted">Pencarian Populer</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCH.map((k) => (
            <button
              key={k}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(k)}
              className="flex h-8 items-center gap-1 rounded-[8px] border border-line bg-surface px-3 text-xs font-medium text-ink shadow-sm transition-colors hover:border-brand hover:text-brand"
            >
              <Icon name="trending_up" size={14} className="text-ink-muted" />
              {k}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-xs font-semibold text-ink-muted">Kategori Frame</p>
        <div className="flex flex-col rounded-2xl border border-line bg-surface shadow-sm">
          {CATEGORY_LINKS.map((c, i) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(c.includes('Pria') ? 'Pria' : 'Wanita')}
              className={cn(
                'flex items-center justify-between px-4 py-3.5 text-sm font-medium text-ink',
                i > 0 && 'border-t border-line',
              )}
            >
              {c}
              <Icon name="chevron_right" size={18} className="text-ink-muted" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
