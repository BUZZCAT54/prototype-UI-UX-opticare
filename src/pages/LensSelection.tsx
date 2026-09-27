import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { BottomSheet } from '../components/ui/BottomSheet'
import { EmptyState } from '../components/ui/Field'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { getProduct } from '../data/products'
import { getLens, lensOptions } from '../data/lenses'
import { useCart } from '../store/CartContext'
import { formatRupiah } from '../utils/format'
import { cn } from '../utils/cn'

export function LensSelection() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { items } = useCart()

  const cartItemId = params.get('item')
  const cartItem = cartItemId ? items.find((i) => i.id === cartItemId) : undefined
  const product = getProduct(params.get('product') ?? cartItem?.productId)
  const [selected, setSelected] = useState<string | null>(cartItem?.lensId ?? null)
  const [helpOpen, setHelpOpen] = useState(false)

  const colorName = useMemo(() => {
    if (cartItem) return cartItem.colorName
    const colorId = params.get('color')
    return product?.colors.find((c) => c.id === colorId)?.name ?? product?.colors[0]?.name ?? ''
  }, [cartItem, params, product])

  const options = useMemo(
    () =>
      product
        ? lensOptions.filter((l) => product.compatibleLenses.includes(l.id))
        : lensOptions,
    [product],
  )

  const framePrice = cartItem ? cartItem.price : (product?.price ?? 0)
  const lens = getLens(selected)
  const total = framePrice + (lens?.price ?? 0)

  if (!product) {
    return (
      <>
        <PageHeader title="Pilih Jenis Lensa" step={{ current: 2, total: 3 }} />
        <main className="flex-1 pb-28">
          <EmptyState
            icon="visibility"
            title="Belum ada frame dipilih"
            description="Pilih frame terlebih dahulu sebelum memilih jenis lensa yang kamu butuhkan."
            action={
              <Button className="mt-4" onClick={() => navigate('/catalog')}>
                Pilih Frame
              </Button>
            }
          />
        </main>
        <BottomNav />
        <ToastHost />
      </>
    )
  }

  const summary = {
    product: product.id,
    color: params.get('color') ?? product.colors[0]?.id ?? '',
    lens: selected ?? '',
    item: cartItem?.id ?? '',
  }

  function goPrescription() {
    const q = new URLSearchParams()
    if (summary.product) q.set('product', summary.product)
    if (summary.color) q.set('color', summary.color)
    if (summary.lens) q.set('lens', summary.lens)
    if (summary.item) q.set('item', summary.item)
    navigate(`/prescription?${q.toString()}`)
  }

  return (
    <>
      <PageHeader
        title="Pilih Jenis Lensa"
        step={{ current: 2, total: 3 }}
        tone="surface"
        actions={<IconButton name="help_outline" label="Bantuan" onClick={() => setHelpOpen(true)} />}
      />

      <main className="flex-1 overflow-y-auto space-y-4 px-5 pb-48 pt-4">
        {/* Konteks frame */}
        <section className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-card">
          <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-canvas p-1">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold tracking-wider text-ink-muted">
                {product.brand.toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-brand">Tersimpan</span>
            </div>
            <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="text-xs text-ink-muted">{colorName}</span>
              <span className="text-sm font-semibold text-ink">{formatRupiah(product.price)}</span>
            </div>
          </div>
        </section>

        {/* Heading */}
        <section className="pt-1">
          <h2 className="text-lg font-semibold text-ink">Kebutuhan Penglihatan</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Pilih lensa yang sesuai dengan aktivitas harian dan kenyamanan matamu.
          </p>
        </section>

        {/* Opsi lensa */}
        <section aria-label="Pilihan jenis lensa" className="space-y-3" role="radiogroup">
          {options.map((l) => {
            const active = selected === l.id
            return (
              <div
                key={l.id}
                role="radio"
                aria-checked={active}
                tabIndex={0}
                onClick={() => setSelected(l.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelected(l.id)
                  }
                }}
                className={cn(
                  'relative cursor-pointer rounded-xl border bg-surface p-4 transition-all duration-150 active:scale-[0.99]',
                  active
                    ? 'border-2 border-brand bg-brand-light/40'
                    : 'border-line hover:border-line-input',
                )}
              >
                <div className={cn('flex items-start justify-between gap-3', l.recommended && 'flex-col gap-2')}>
                  {l.recommended && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand">
                      <Icon name="thumb_up" size={14} fill />
                      Recommended
                    </span>
                  )}
                  <div className={cn('flex items-start justify-between gap-3', !l.recommended && 'w-full')}>
                    <div className="flex items-start gap-3.5">
                      <span
                        className={cn(
                          'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                          active
                            ? 'border-brand/30 bg-brand-light text-brand'
                            : 'border-line bg-canvas text-ink-muted',
                        )}
                      >
                        <Icon name={l.icon} size={22} />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-ink">{l.name}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{l.description}</p>
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="text-xs text-ink-muted">Mulai dari</span>
                          <span className="text-sm font-semibold text-ink">
                            {formatRupiah(l.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                        active ? 'border-brand bg-brand' : 'border-line-input',
                      )}
                    >
                      {active && <Icon name="check" size={12} className="text-white" />}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        {/* Helper */}
        <section className="flex items-center justify-between gap-2.5 rounded-xl border border-line bg-surface p-3.5 shadow-card">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
              <Icon name="info" size={18} />
            </span>
            <div>
              <h4 className="text-xs font-semibold text-ink">Bingung memilih lensa?</h4>
              <p className="text-[11px] leading-tight text-ink-muted">
                Pilih berdasarkan aktivitas harian atau gunakan rekomendasi dokter.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-brand hover:underline"
          >
            Panduan Lensa
            <Icon name="arrow_forward" size={14} />
          </button>
        </section>
      </main>

      {/* Ringkasan */}
      <StickyBar className="space-y-3">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span className="truncate">Harga Frame</span>
          <span className="ml-2 shrink-0 font-medium text-ink">{formatRupiah(framePrice)}</span>
        </div>
        {lens && (
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="truncate">Lensa {lens.name}</span>
            <span className="ml-2 shrink-0 font-medium text-ink">{formatRupiah(lens.price)}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between border-t border-dashed border-line pt-2">
          <div>
            <span className="block text-xs font-semibold text-ink-muted">Total Estimasi</span>
            <span className="text-[22px] font-bold leading-7 text-ink">{formatRupiah(total)}</span>
          </div>
          <span className="text-[11px] font-medium text-ink-muted">
            {lens ? 'Lensa sudah dipilih' : 'Pilih lensa untuk melanjutkan'}
          </span>
        </div>
        <Button
          fullWidth
          size="lg"
          className="h-[50px] rounded-xl"
          disabled={!selected}
          trailingIcon="arrow_forward"
          onClick={goPrescription}
        >
          Lanjut ke Resep Mata
        </Button>
      </StickyBar>

      <BottomSheet open={helpOpen} onClose={() => setHelpOpen(false)} title="Panduan Memilih Lensa">
        <div className="space-y-3">
          {lensOptions.map((l) => (
            <div key={l.id} className="rounded-xl border border-line bg-canvas p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{l.name}</span>
                <span className="text-xs font-semibold text-brand">
                  {formatRupiah(l.priceFrom)}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{l.description}</p>
            </div>
          ))}
          <p className="text-center text-[11px] text-ink-muted">
            Ragu? Booking pemeriksaan mata gratis untuk rekomendasi dari optometris OptiCare.
          </p>
        </div>
      </BottomSheet>

      <BottomNav />
      <ToastHost />
    </>
  )
}
