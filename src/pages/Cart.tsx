import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { ToastHost } from '../components/ui/Toast'
import { getLens } from '../data/lenses'
import { findPromo, promos, shippingOptions } from '../data/checkout'
import { useCart } from '../store/CartContext'
import { useCheckout } from '../store/CheckoutContext'
import { usePrescriptions } from '../store/PrescriptionContext'
import { useToast } from '../store/ToastContext'
import type { CartItem } from '../types'
import { formatRupiah } from '../utils/format'
import { cn } from '../utils/cn'

export function Cart() {
  const navigate = useNavigate()
  const { items, count, setQty, remove, total } = useCart()
  const { state, patch } = useCheckout()
  const { active } = usePrescriptions()
  const { push } = useToast()

  const [promoInput, setPromoInput] = useState(state.promo ?? '')
  const [promoError, setPromoError] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<CartItem | null>(null)

  const shipping = useMemo(
    () => shippingOptions.find((s) => s.id === state.shippingId) ?? shippingOptions[0],
    [state.shippingId],
  )
  const applied = findPromo(state.promo ?? '')
  const discount = applied && total >= applied.minTotal ? applied.amount : 0
  const grandTotal = total - discount + shipping.price

  function applyPromo() {
    const code = promoInput.trim()
    if (!code) return
    const promo = findPromo(code)
    if (!promo) {
      setPromoError('Kode promo tidak valid')
      patch({ promo: null })
      return
    }
    if (total < promo.minTotal) {
      setPromoError(`Minimal belanja ${formatRupiah(promo.minTotal)}`)
      patch({ promo: null })
      return
    }
    setPromoError(null)
    patch({ promo: promo.code })
    push(`Kode ${promo.code} dipakai`)
  }

  if (items.length === 0) {
    return (
      <>
        <PageHeader
          tone="surface"
          actions={<IconButton name="help_outline" label="Bantuan" onClick={() => push('Hubungi OptiCare di 0800-1234', 'info')} />}
        >
          <h1 className="text-[17px] font-bold tracking-tight text-ink">Keranjang Belanja</h1>
        </PageHeader>
        <main className="flex flex-1 flex-col items-center justify-center px-5 py-6 text-center">
          <div className="mb-5 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand transition-transform hover:scale-105">
            <Icon name="shopping_bag" size={36} />
          </div>
          <h2 className="mb-2 text-[22px] font-bold text-ink">Keranjangmu masih kosong</h2>
          <p className="mb-7 max-w-[280px] text-sm leading-relaxed text-ink-muted">
            Temukan frame yang cocok untuk mulai berbelanja.
          </p>
          <Button size="lg" className="h-[50px] w-[280px] rounded-[12px]" onClick={() => navigate('/catalog')}>
            Lihat Katalog
          </Button>
        </main>
        <footer className="flex w-full items-center justify-center gap-6 border-t border-line bg-surface px-5 pb-8 pt-4">
          <span className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            <Icon name="verified" size={16} className="text-brand" />
            100% Original
          </span>
          <span className="h-3 w-px bg-line" />
          <span className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            <Icon name="published_with_changes" size={16} className="text-brand" />
            Garansi 1 Tahun
          </span>
        </footer>
        <BottomNav />
        <ToastHost />
      </>
    )
  }

  return (
    <>
      <PageHeader
        tone="surface"
        actions={<IconButton name="help_outline" label="Bantuan" onClick={() => push('Hubungi OptiCare di 0800-1234', 'info')} />}
      >
        <div className="flex items-baseline gap-1.5">
          <h1 className="truncate text-[17px] font-bold tracking-tight text-ink">
            Keranjang Belanja
          </h1>
          <span className="text-xs font-medium text-ink-muted">({count} Barang)</span>
        </div>
      </PageHeader>

      <main className="flex-1 space-y-4 px-5 pb-40 pt-5">
        {/* Trust banner */}
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
            <Icon name="verified_user" size={20} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold leading-tight text-ink">
              Jaminan Lensa Akurat &amp; Presisi Optik
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
              Diverifikasi oleh optisioner berlisensi resmi OptiCare.
            </p>
          </div>
        </div>

        {/* Items */}
        {items.map((item) => {
          const lens = getLens(item.lensId)
          return (
            <div key={item.id} className="relative rounded-xl border border-line bg-surface p-3.5">
              <div className="flex gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-canvas p-1">
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      {item.brand}
                    </span>
                    <h2 className="truncate text-sm font-bold text-brand">{item.name}</h2>
                    <p className="mt-0.5 text-xs text-ink-muted">Warna: {item.colorName}</p>
                  </div>
                  <span className="mt-1 text-sm font-bold text-ink">
                    {formatRupiah(item.price)}
                    {item.qty > 1 && (
                      <span className="ml-1 text-xs font-medium text-ink-muted">
                        × {item.qty}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Lensa */}
              <div
                className={cn(
                  'mt-2.5 flex items-start gap-2 rounded-lg border p-2.5',
                  item.lensId
                    ? 'border-brand/30 bg-brand-light'
                    : 'border-dashed border-line-input bg-canvas',
                )}
              >
                <span
                  className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    item.lensId ? 'bg-brand ring-4 ring-brand/20' : 'bg-line-input',
                  )}
                />
                <div className="ml-0.5 flex-1">
                  {item.lensId ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand">
                          Lensa: {item.lensName ?? lens?.name}
                        </span>
                        <span className="text-xs font-bold text-brand">
                          +{formatRupiah(item.lensPrice)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-tight text-ink-muted">
                        {lens?.description}
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-xs font-bold text-ink-muted">
                          Belum memilih lensa
                        </span>
                        <p className="mt-0.5 text-[11px] text-ink-muted">
                          Wajib dipilih sebelum checkout.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/lens-selection?item=${encodeURIComponent(item.id)}`)}
                      >
                        Pilih Lensa
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Qty & hapus */}
              <div className="mt-1.5 flex items-center justify-between border-t border-line pt-2.5">
                <button
                  type="button"
                  aria-label="Hapus Item"
                  onClick={() => setPendingRemove(item)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-error transition-colors hover:bg-error/10"
                >
                  <Icon name="delete_outline" size={18} />
                </button>
                <div className="flex items-center rounded-lg border border-line-input bg-surface p-0.5">
                  <button
                    type="button"
                    aria-label="Kurangi"
                    onClick={() => (item.qty <= 1 ? setPendingRemove(item) : setQty(item.id, item.qty - 1))}
                    className="grid h-7 w-7 place-items-center rounded text-ink-muted transition-colors hover:bg-brand-light active:scale-95"
                  >
                    <Icon name="remove" size={15} />
                  </button>
                  <span className="w-7 text-center text-xs font-semibold text-ink">{item.qty}</span>
                  <button
                    type="button"
                    aria-label="Tambah"
                    onClick={() => setQty(item.id, item.qty + 1)}
                    className="grid h-7 w-7 place-items-center rounded text-ink-muted transition-colors hover:bg-brand-light active:scale-95"
                  >
                    <Icon name="add" size={15} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Resep */}
        {active && (
          <div className="rounded-xl border border-line bg-surface p-3.5">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div className="flex items-center gap-1.5">
                <Icon name="visibility" size={19} className="text-brand" />
                <h3 className="text-xs font-bold text-ink">Resep Mata Digunakan</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-md bg-brand-light px-2 py-0.5 text-[11px] font-semibold text-success">
                  <Icon name="check_circle" size={13} />
                  Tervalidasi
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/prescription')}
                  className="ml-1 text-xs font-semibold text-brand hover:underline"
                >
                  Ubah
                </button>
              </div>
            </div>
            <div className="mt-2.5 space-y-1.5 rounded-lg border border-line bg-canvas p-2.5">
              <div className="grid grid-cols-4 border-b border-line pb-1 text-center text-[11px] font-semibold text-ink-muted">
                <span className="text-left">Mata</span>
                <span>SPH</span>
                <span>CYL</span>
                <span>AXIS</span>
              </div>
              {(
                [
                  ['OD', '(Kanan)', active.od],
                  ['OS', '(Kiri)', active.os],
                ] as const
              ).map(([code, side, eye], i) => (
                <div
                  key={code}
                  className={cn(
                    'grid grid-cols-4 items-center pt-0.5 text-xs font-medium text-ink',
                    i === 1 && 'border-t border-line pt-1.5',
                  )}
                >
                  <span className="flex items-center gap-1 text-left font-bold text-brand">
                    {code} <span className="text-[10px] font-normal text-ink-muted">{side}</span>
                  </span>
                  <span className="text-center font-mono">{eye.sph}</span>
                  <span className="text-center font-mono">{eye.cyl}</span>
                  <span className="text-center font-mono">{eye.axis}°</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 flex items-center justify-between px-1 text-xs">
              <span className="text-ink-muted">Jarak Pupil (Pupillary Distance / PD)</span>
              <span className="font-mono font-bold text-ink">{active.od.pd} mm</span>
            </div>
          </div>
        )}

        {/* Promo */}
        <div className="space-y-2.5 rounded-xl border border-line bg-surface p-3.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <Icon name="confirmation_number" size={18} className="text-brand" />
              Kupon &amp; Promo
            </span>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Pilih Lainnya
            </button>
          </div>

          {state.promo && !promoError ? (
            <div className="flex items-center justify-between rounded-xl border border-brand/30 bg-brand-light p-2.5">
              <div className="flex items-center gap-2">
                <Icon name="check_circle" size={19} className="text-brand" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold tracking-wider text-brand">
                      {state.promo}
                    </span>
                    <span className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                      Tersimpan
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium leading-tight text-success">
                    {applied?.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  patch({ promo: null })
                  setPromoInput('')
                  setPromoError(null)
                }}
                className="px-1 text-xs font-semibold text-error hover:underline"
              >
                Hapus
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value)
                    setPromoError(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                  placeholder="Masukkan kode promo"
                  aria-label="Kode promo"
                  aria-invalid={Boolean(promoError)}
                  className={cn(
                    'h-11 flex-1 rounded-xl border bg-surface px-3.5 text-xs font-semibold uppercase tracking-wider text-ink outline-none transition-colors placeholder:font-normal placeholder:normal-case placeholder:tracking-normal focus:ring-2',
                    promoError
                      ? 'border-2 border-error focus:ring-error/20'
                      : 'border-line-input focus:border-brand focus:ring-brand/20',
                  )}
                />
                <Button size="md" className="h-11 rounded-xl px-5 text-xs" onClick={applyPromo}>
                  Gunakan
                </Button>
              </div>
              {promoError && (
                <p className="mt-2 flex items-center gap-1.5 pl-0.5 text-[11.5px] font-medium text-error">
                  <Icon name="info" size={14} />
                  {promoError}
                </p>
              )}
              {!promoError && (
                <p className="mt-2 text-[11px] text-ink-muted">
                  Coba kode{' '}
                  <button
                    type="button"
                    onClick={() => setPromoInput(promos[0].code)}
                    className="font-semibold text-brand underline"
                  >
                    {promos[0].code}
                  </button>{' '}
                  atau{' '}
                  <button
                    type="button"
                    onClick={() => setPromoInput(promos[1].code)}
                    className="font-semibold text-brand underline"
                  >
                    {promos[1].code}
                  </button>
                  .
                </p>
              )}
            </div>
          )}
        </div>

        {/* Ringkasan */}
        <div className="space-y-2.5 rounded-xl border border-line bg-surface p-3.5">
          <h3 className="text-xs font-bold text-ink">Ringkasan Belanja</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Subtotal Produk &amp; Lensa</span>
              <span className="font-semibold text-ink">{formatRupiah(total)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Diskon Promo ({state.promo})</span>
                <span className="font-semibold text-success">-{formatRupiah(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-ink-muted">
                Estimasi Pengiriman
                <Icon name="info" size={14} />
              </span>
              <span className="font-semibold text-ink">
                {shipping.price === 0 ? 'Gratis' : formatRupiah(shipping.price)}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-2">
              <div>
                <span className="block text-xs font-bold text-ink">Total Belanja</span>
                <span className="text-[11px] text-ink-muted">Termasuk PPN &amp; Biaya Optik</span>
              </div>
              <span className="text-[17px] font-bold text-ink">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Reassurance */}
        <div className="grid grid-cols-2 gap-2 pt-0.5 text-center">
          {[
            ['replay', 'Garansi 30 Hari Ganti Lensa'],
            ['local_shipping', 'Gratis Kotak & Lap Microfiber'],
          ].map(([icon, text]) => (
            <div
              key={text}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface p-2.5"
            >
              <Icon name={icon} size={18} className="shrink-0 text-brand" />
              <span className="text-[11px] font-medium leading-tight text-ink-muted">{text}</span>
            </div>
          ))}
        </div>
      </main>

      <StickyBar>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-ink-muted">Total Pembayaran</span>
            <span className="text-[18px] font-bold leading-tight text-ink">
              {formatRupiah(grandTotal)}
            </span>
            {discount > 0 && (
              <span className="text-[11px] font-semibold text-success">
                Hemat {formatRupiah(discount)}
              </span>
            )}
          </div>
          <Button
            className="h-12 max-w-[200px] flex-1 rounded-xl"
            trailingIcon="arrow_forward"
            onClick={() => {
              const missing = items.find((i) => !i.lensId)
              if (missing) {
                push('Pilih jenis lensa untuk semua item dulu', 'error')
                navigate(`/lens-selection?item=${encodeURIComponent(missing.id)}`)
                return
              }
              navigate('/checkout')
            }}
          >
            Lanjut ke Checkout
          </Button>
        </div>
      </StickyBar>

      <Modal
        open={Boolean(pendingRemove)}
        onClose={() => setPendingRemove(null)}
        tone="danger"
        icon="delete_outline"
        title="Hapus item ini?"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" fullWidth onClick={() => setPendingRemove(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                if (pendingRemove) remove(pendingRemove.id)
                setPendingRemove(null)
                push('Item dihapus dari keranjang', 'info')
              }}
            >
              Hapus
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-muted">
          {pendingRemove?.brand} {pendingRemove?.name} akan dihilangkan dari keranjang belanja
          kamu.
        </p>
      </Modal>

      <BottomNav />
      <ToastHost />
    </>
  )
}
