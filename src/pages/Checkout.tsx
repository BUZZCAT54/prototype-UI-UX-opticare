import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Section, StickyBar } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { BottomSheet } from '../components/ui/BottomSheet'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { addresses, findPromo, paymentOptions, shippingOptions } from '../data/checkout'
import { branches, getBranch } from '../data/branches'
import { useCart } from '../store/CartContext'
import { useCheckout } from '../store/CheckoutContext'
import { usePrescriptions } from '../store/PrescriptionContext'
import { useToast } from '../store/ToastContext'
import { formatRupiah } from '../utils/format'
import { cn } from '../utils/cn'

const SERVICE_FEE = 0

export function Checkout() {
  const navigate = useNavigate()
  const { items, total } = useCart()
  const { state, patch } = useCheckout()
  const { active } = usePrescriptions()
  const { push } = useToast()
  const [sheet, setSheet] = useState<'address' | 'branch' | null>(null)

  const address = addresses.find((a) => a.id === state.addressId) ?? addresses[0]
  const branch = getBranch(state.branchId) ?? branches[0]
  const shipping = shippingOptions.find((s) => s.id === state.shippingId) ?? shippingOptions[0]
  const pickup = state.fulfilment === 'pickup'

  const shippingCost = pickup ? 0 : shipping.price
  const applied = findPromo(state.promo ?? '')
  const discount = applied && total >= applied.minTotal ? applied.amount : 0
  const grandTotal = total - discount + shippingCost + SERVICE_FEE

  const itemsCount = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items],
  )

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Checkout & Pembayaran" />
        <main className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-brand-light text-brand">
            <Icon name="shopping_cart" size={36} />
          </div>
          <h2 className="mb-2 text-[22px] font-bold text-ink">Belum ada item untuk dibayar</h2>
          <p className="mb-7 max-w-[280px] text-sm leading-relaxed text-ink-muted">
            Tambahkan frame dan lensa ke keranjang terlebih dahulu.
          </p>
          <Button size="lg" className="h-[50px] w-[280px] rounded-[12px]" onClick={() => navigate('/cart')}>
            Buka Keranjang
          </Button>
        </main>
        <BottomNav />
        <ToastHost />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Checkout & Pembayaran" actions={<IconButton name="lock" label="Transaksi terenkripsi" />} />

      <main className="flex-1 space-y-4 px-5 pb-36 pt-5">
        {/* Fulfilment */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-ink">Cara Menerima Pesanan</h3>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-ink-muted">
              <Icon name="local_shipping" size={14} className="text-brand" />
              Garansi Cepat
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <FulfilmentCard
              icon="home"
              title="Dikirim ke Rumah"
              desc="Pesanan dikirim ke alamatmu"
              selected={!pickup}
              onClick={() => patch({ fulfilment: 'delivery' })}
            />
            <FulfilmentCard
              icon="store"
              title="Ambil di Optik"
              desc="Cabang OptiCare · Bebas Ongkir"
              selected={pickup}
              onClick={() => patch({ fulfilment: 'pickup' })}
            />
          </div>
        </section>

        {/* Alamat / Cabang */}
        {pickup ? (
          <section className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between pb-2.5">
              <div className="flex items-center gap-1.5">
                <Icon name="storefront" size={19} className="text-brand" />
                <h3 className="text-xs font-bold text-ink">Cabang Optik Pengambilan</h3>
              </div>
              <button
                type="button"
                onClick={() => setSheet('branch')}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Ubah Cabang
              </button>
            </div>
            <div className="rounded-lg border border-brand/30 bg-brand-light p-3">
              <div className="flex items-center gap-2">
                <Icon name="check_circle" size={16} className="text-success" />
                <span className="text-[11px] font-semibold text-success">Siap Diambil di Toko</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-ink">
                {branch.name}
                <span className="ml-2 text-[11px] font-medium text-ink-muted">
                  {branch.distanceKm} km dari lokasimu
                </span>
              </p>
              <p className="mt-1 text-xs leading-snug text-ink-muted">{branch.address}</p>
              <div className="mt-2.5 flex items-center gap-1.5 border-t border-brand/20 pt-2 text-xs">
                <Icon name="schedule" size={14} className="text-brand" />
                <span className="text-ink-muted">Jam Operasional:</span>
                <span className="font-semibold text-ink">{branch.hours}</span>
              </div>
            </div>
            <p className="mt-2.5 flex gap-1.5 rounded-lg bg-canvas p-2.5 text-[11px] leading-snug text-ink-muted">
              <Icon name="info" size={14} className="mt-0.5 shrink-0 text-brand" />
              Notifikasi akan dikirimkan via WhatsApp setelah lensa selesai dipasang dan siap
              diambil.
            </p>
          </section>
        ) : (
          <section className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between pb-2.5">
              <h3 className="text-xs font-bold text-ink">Alamat Pengiriman</h3>
              <button
                type="button"
                onClick={() => setSheet('address')}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Ubah
              </button>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg bg-canvas p-3">
              <Icon name="location_on" size={18} className="mt-0.5 shrink-0 text-brand" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink">{address.label}</span>
                  {address.isDefault && (
                    <span className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-semibold text-ink">
                  {address.recipient}{' '}
                  <span className="font-normal text-ink-muted">({address.phone})</span>
                </p>
                <p className="mt-0.5 text-xs leading-snug text-ink-muted">{address.line}</p>
              </div>
            </div>
          </section>
        )}

        {/* Item */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between pb-2.5">
            <h3 className="text-xs font-bold text-ink">
              Item Pesanan ({itemsCount} Frame &amp; Lensa)
            </h3>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
              <Icon name="verified" size={14} />
              Produk Original
            </span>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas p-1">
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {item.brand} {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Warna: {item.colorName} ·{' '}
                    {item.lensId ? `Lensa: ${item.lensName}` : 'Lensa belum dipilih'}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-ink">
                      {formatRupiah((item.price + item.lensPrice) * item.qty)}
                    </span>
                    <span className="text-[11px] text-ink-muted">Qty: {item.qty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resep */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between pb-2.5">
            <div className="flex items-center gap-1.5">
              <Icon name="visibility" size={19} className="text-brand" />
              <h3 className="text-xs font-bold text-ink">Resep Mata Terpasang</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md bg-brand-light px-2 py-0.5 text-[11px] font-semibold text-success">
                <Icon name="check_circle" size={13} />
                Terverifikasi
              </span>
              <button
                type="button"
                onClick={() => navigate('/prescription')}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Ubah
              </button>
            </div>
          </div>
          {active ? (
            <>
              <p className="mb-2 text-xs font-semibold text-ink">{active.label}</p>
              <div className="space-y-1.5 rounded-lg border border-line bg-canvas p-2.5">
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
              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-ink-muted">Pupillary Distance (PD):</span>
                <span className="font-mono font-bold text-ink">{active.od.pd} mm</span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-success/10 p-2.5 text-[11px] font-semibold text-success">
                <Icon name="check_circle" size={14} />
                Presisi Klinis
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-canvas p-3">
              <p className="text-xs leading-snug text-ink-muted">
                Belum ada resep terpasang. Tambahkan resep agar lensa dipotong sesuai ukuranmu.
              </p>
              <Button size="sm" onClick={() => navigate('/prescription')}>
                Tambah Resep
              </Button>
            </div>
          )}
        </section>

        {/* Opsi kirim/ambil */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <h3 className="mb-3 text-xs font-bold text-ink">
            {pickup ? 'Opsi Pengambilan' : 'Opsi Pengiriman'}
          </h3>
          {pickup ? (
            <div className="rounded-lg border border-brand/30 bg-brand-light p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">Ambil Langsung di Cabang</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    Estimasi pasang lensa: 1–2 hari kerja di laboratorium OptiCare
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-success">Bebas Ongkir</span>
                  <span className="text-xs font-semibold text-ink">Gratis (Rp0)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {shippingOptions
                .filter((s) => s.id !== 'pickup')
                .map((option) => (
                  <RadioRow
                    key={option.id}
                    selected={state.shippingId === option.id}
                    onSelect={() => patch({ shippingId: option.id })}
                    icon="local_shipping"
                    title={option.name}
                    detail={option.detail}
                    right={
                      <span className="text-xs font-semibold text-ink">
                        {option.price === 0 ? 'Gratis' : formatRupiah(option.price)}
                      </span>
                    }
                  />
                ))}
            </div>
          )}
        </section>

        {/* Pembayaran */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-ink">Metode Pembayaran</h3>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-ink-muted">
              <Icon name="verified_user" size={14} className="text-brand" />
              Terenkripsi
            </span>
          </div>
          <div className="space-y-2.5">
            {paymentOptions.map((option) => (
              <RadioRow
                key={option.id}
                selected={state.paymentId === option.id}
                onSelect={() => patch({ paymentId: option.id })}
                icon={option.icon}
                title={
                  option.id === 'bca-va' ? 'BCA Virtual Account / Bank Transfer' : option.name
                }
                detail={option.detail}
                badge={option.badge}
              />
            ))}
          </div>
        </section>

        {/* Catatan */}
        <Section title="Catatan untuk Optik (opsional)">
          <textarea
            value={state.note}
            onChange={(e) => patch({ note: e.target.value })}
            rows={3}
            placeholder="Mis. minta dipasang lensa anti-silau untuk kerja di depan layar"
            className="w-full resize-none rounded-xl border border-line-input bg-surface p-3.5 text-xs text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </Section>

        {/* Ringkasan */}
        <section className="space-y-2.5 rounded-xl border border-line bg-surface p-4">
          <h3 className="text-xs font-bold text-ink">Ringkasan Pembayaran</h3>
          <div className="space-y-2 text-xs">
            <Row label="Subtotal (Frame + Lensa)" value={formatRupiah(total)} />
            {discount > 0 && (
              <Row
                label={`Diskon Promo (${state.promo})`}
                value={`-${formatRupiah(discount)}`}
                tone="success"
                icon="sell"
              />
            )}
            <Row
              label={pickup ? 'Biaya Pengiriman (Ambil di Optik)' : `Biaya Pengiriman (${shipping.name.split(' (')[0]})`}
              value={shippingCost === 0 ? 'Gratis (Rp0)' : formatRupiah(shippingCost)}
            />
            <Row label="Biaya Layanan & Asuransi Optik" value="Gratis (Rp0)" />
            <div className="flex items-baseline justify-between border-t border-line pt-2.5">
              <span className="text-xs font-bold text-ink">Total Tagihan</span>
              <span className="text-[17px] font-bold text-ink">{formatRupiah(grandTotal)}</span>
            </div>
          </div>
        </section>

        <p className="flex items-start gap-2 px-1 pb-2 text-[11px] leading-snug text-ink-muted">
          <Icon name="verified" size={14} className="mt-0.5 shrink-0 text-brand" />
          Transaksi aman dan terenkripsi. Garansi lensa &amp; frame 100% original dengan
          sertifikat resmi OptiCare.
        </p>
      </main>

      <BottomSheet
        open={sheet === 'address'}
        onClose={() => setSheet(null)}
        title="Pilih Alamat Pengiriman"
      >
        <div className="space-y-2.5">
          {addresses.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                patch({ addressId: item.id })
                setSheet(null)
                push('Alamat pengiriman diubah')
              }}
              className={cn(
                'w-full rounded-xl border p-3.5 text-left transition-colors',
                item.id === state.addressId
                  ? 'border-brand bg-brand-light'
                  : 'border-line bg-surface hover:border-line-input',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">{item.label}</span>
                {item.id === state.addressId && (
                  <Icon name="check_circle" size={16} className="text-brand" />
                )}
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {item.recipient} ({item.phone})
              </p>
              <p className="mt-0.5 text-xs leading-snug text-ink-muted">{item.line}</p>
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === 'branch'} onClose={() => setSheet(null)} title="Pilih Cabang Optik">
        <div className="space-y-2.5">
          {branches.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                patch({ branchId: item.id })
                setSheet(null)
                push(`Cabang ${item.name} dipilih`)
              }}
              className={cn(
                'w-full rounded-xl border p-3.5 text-left transition-colors',
                item.id === state.branchId
                  ? 'border-brand bg-brand-light'
                  : 'border-line bg-surface hover:border-line-input',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">{item.name}</span>
                <span className="text-[11px] font-medium text-ink-muted">
                  {item.distanceKm} km
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-snug text-ink-muted">{item.address}</p>
              <p className="mt-1 text-[11px] font-medium text-brand">{item.hours}</p>
            </button>
          ))}
        </div>
      </BottomSheet>

      <StickyBar>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-ink-muted">Total Tagihan</span>
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
            className="h-12 max-w-[220px] flex-1 rounded-xl"
            trailingIcon="arrow_forward"
            onClick={() => navigate('/payment')}
          >
            Bayar Sekarang
          </Button>
        </div>
      </StickyBar>

      <ToastHost />
    </>
  )
}

function FulfilmentCard({
  icon,
  title,
  desc,
  selected,
  onClick,
}: {
  icon: string
  title: string
  desc: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'relative rounded-xl border p-3 text-left transition-colors',
        selected ? 'border-brand bg-brand-light' : 'border-line bg-surface hover:border-line-input',
      )}
    >
      <span
        className={cn(
          'mb-2 grid h-8 w-8 place-items-center rounded-lg',
          selected ? 'bg-brand text-white' : 'bg-canvas text-ink-muted',
        )}
      >
        <Icon name={icon} size={18} />
      </span>
      <p className="text-xs font-bold text-ink">{title}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-ink-muted">{desc}</p>
      {selected && (
        <Icon
          name="check_circle"
          size={16}
          className="absolute right-2.5 top-2.5 text-brand"
        />
      )}
    </button>
  )
}

function RadioRow({
  selected,
  onSelect,
  icon,
  title,
  detail,
  badge,
  right,
}: {
  selected: boolean
  onSelect: () => void
  icon: string
  title: string
  detail: string
  badge?: string
  right?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
        selected ? 'border-brand bg-brand-light' : 'border-line bg-surface hover:border-line-input',
      )}
    >
      <span
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
          selected ? 'bg-brand text-white' : 'bg-canvas text-ink-muted',
        )}
      >
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-xs font-bold text-ink">{title}</span>
          {badge && (
            <span className="shrink-0 rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-ink-muted">{detail}</span>
      </span>
      {right}
      <span
        className={cn(
          'grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full border-2',
          selected ? 'border-brand' : 'border-line-input',
        )}
        style={{ width: 18, height: 18 }}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
      </span>
    </button>
  )
}

function Row({
  label,
  value,
  tone,
  icon,
}: {
  label: string
  value: string
  tone?: 'success'
  icon?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('flex items-center gap-1 text-ink-muted', tone === 'success' && 'text-ink-muted')}>
        {icon && <Icon name={icon} size={14} />}
        {label}
      </span>
      <span className={cn('font-semibold text-ink', tone === 'success' && 'text-success')}>
        {value}
      </span>
    </div>
  )
}
