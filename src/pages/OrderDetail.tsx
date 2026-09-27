import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { getStatusMeta } from '../data/orders'
import { useOrders } from '../store/OrderContext'
import { usePrescriptions } from '../store/PrescriptionContext'
import { useProfile } from '../store/ProfileContext'
import { useToast } from '../store/ToastContext'
import { cn } from '../utils/cn'
import { formatDateFull, formatRupiah } from '../utils/format'

export function OrderDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { get } = useOrders()
  const { active } = usePrescriptions()
  const { profile } = useProfile()
  const { push } = useToast()

  const order = get(id)

  if (!order) {
    return (
      <>
        <PageHeader title="Detail Pesanan" />
        <main className="flex flex-1 items-center justify-center px-5 text-center">
          <p className="text-sm text-ink-muted">Pesanan tidak ditemukan.</p>
        </main>
        <BottomNav />
        <ToastHost />
      </>
    )
  }

  const meta = getStatusMeta(order.status)
  const eta = new Date(new Date(order.createdAt).getTime() + 3 * 86_400_000)
  const trackable = !['completed', 'cancelled'].includes(order.status)

  return (
    <>
      <PageHeader
        title="Detail Pesanan"
        actions={
          <IconButton
            name="help_outline"
            label="Bantuan"
            onClick={() => push('Hubungi OptiCare di 0800-1234', 'info')}
          />
        }
      />

      <main className="flex-1 space-y-4 px-5 pb-32 pt-4">
        {/* Kop */}
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold',
                order.status === 'completed' && 'bg-success/10 text-success',
                order.status === 'cancelled' && 'bg-error/10 text-error',
                trackable && order.status !== 'completed' && 'bg-brand-light text-brand',
              )}
            >
              <Icon name={meta.icon} size={13} />
              {meta.shortLabel}
            </span>
            <span className="font-mono text-xs font-bold text-ink">{order.code}</span>
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">
            Dipesan pada {formatDateFull(order.createdAt)}
          </p>
          {trackable && (
            <p className="mt-0.5 text-[11px] text-ink-muted">
              Estimasi selesai{' '}
              <span className="font-semibold text-ink">{formatDateFull(eta)}</span>
            </p>
          )}
        </div>

        {/* Item */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between pb-2.5">
            <h3 className="text-xs font-bold text-ink">
              Item Pesanan ({order.itemCount} barang)
            </h3>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
              <Icon name="verified" size={14} />
              Produk Original
            </span>
          </div>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={`${item.productId}-${i}`} className="flex gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas p-1">
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {item.brand} {item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {item.colorName}
                    {item.lensName ? ` · Lensa ${item.lensName}` : ''}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-ink">
                      {formatRupiah(item.price * item.qty)}
                    </span>
                    <span className="text-[11px] text-ink-muted">Qty: {item.qty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline ringkas */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <h3 className="mb-2.5 text-xs font-bold text-ink">Riwayat Pesanan</h3>
          <div className="space-y-2.5">
            {order.timeline.map((event, i) => {
              const s = getStatusMeta(event.status)
              return (
                <div key={`${event.status}-${i}`} className="flex items-start gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-light text-brand">
                    <Icon name={s.icon} size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-ink">{s.label}</span>
                      <span className="font-mono text-[11px] text-ink-muted">
                        {new Date(event.at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        ·{' '}
                        {new Date(event.at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {event.note && (
                      <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{event.note}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Pengiriman / pickup */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-ink">
            <Icon name="pin_drop" size={16} className="text-brand" />
            {order.fulfilment === 'pickup' ? 'Cabang Pengambilan' : 'Alamat Pengiriman'}
          </h3>
          <p className="text-xs font-semibold text-ink">{profile.name}</p>
          <p className="text-[11px] text-ink-muted">{profile.phone}</p>
          <p className="mt-1 text-xs leading-snug text-ink-muted">
            {order.address ??
              'OptiCare Padang · Jl. Khatib Sulaiman No. 18, Lolong Belanti, Kota Padang'}
          </p>
          <p className="mt-2 border-t border-line pt-2 text-[11px] text-ink-muted">
            Kurir: <span className="font-semibold text-ink">{order.courier ?? 'Ambil di Optik'}</span>
            {order.resi && (
              <>
                {' · '}
                <span className="font-mono font-semibold text-ink">{order.resi}</span>
              </>
            )}
          </p>
        </section>

        {/* Resep */}
        {active && (
          <section className="rounded-xl border border-line bg-surface p-4">
            <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-ink">
              <Icon name="lens" size={16} className="text-brand" />
              Resep Mata Digunakan
            </h3>
            <div className="grid grid-cols-4 rounded-lg bg-canvas p-2.5 text-center text-xs text-ink">
              <span className="text-left text-[11px] font-semibold text-ink-muted">Mata</span>
              <span className="text-[11px] font-semibold text-ink-muted">SPH</span>
              <span className="text-[11px] font-semibold text-ink-muted">CYL</span>
              <span className="text-[11px] font-semibold text-ink-muted">AXIS</span>
              <span className="mt-1.5 text-left font-bold text-brand">OD</span>
              <span className="mt-1.5 font-mono">{active.od.sph}</span>
              <span className="mt-1.5 font-mono">{active.od.cyl}</span>
              <span className="mt-1.5 font-mono">{active.od.axis}°</span>
              <span className="mt-1.5 border-t border-line pt-1.5 text-left font-bold text-brand">
                OS
              </span>
              <span className="mt-1.5 border-t border-line pt-1.5 font-mono">{active.os.sph}</span>
              <span className="mt-1.5 border-t border-line pt-1.5 font-mono">{active.os.cyl}</span>
              <span className="mt-1.5 border-t border-line pt-1.5 font-mono">{active.os.axis}°</span>
            </div>
            <p className="mt-2 flex justify-between text-xs">
              <span className="text-ink-muted">Jarak Pupil (PD)</span>
              <span className="font-mono font-bold text-ink">{active.od.pd} mm</span>
            </p>
          </section>
        )}

        {/* Pembayaran */}
        <section className="space-y-2 rounded-xl border border-line bg-surface p-4 text-xs">
          <h3 className="text-xs font-bold text-ink">Ringkasan Pembayaran</h3>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Subtotal Produk &amp; Lensa</span>
            <span className="font-semibold text-ink">{formatRupiah(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Diskon Promo</span>
              <span className="font-semibold text-success">
                -{formatRupiah(order.discount)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Biaya Pengiriman</span>
            <span className="font-semibold text-ink">
              {order.shippingCost === 0 ? 'Gratis' : formatRupiah(order.shippingCost)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Metode Pembayaran</span>
            <span className="font-semibold text-ink">{order.paymentMethod}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-2.5">
            <span className="font-bold text-ink">
              {order.status === 'cancelled' ? 'Pengembalian Dana' : 'Total Tagihan'}
            </span>
            <span className="text-[17px] font-bold text-ink">{formatRupiah(order.total)}</span>
          </div>
          {order.status === 'cancelled' && (
            <p className="text-[11px] font-semibold text-success">
              Refund Selesai · Dana dikembalikan ke metode pembayaran asal.
            </p>
          )}
        </section>
      </main>

      <StickyBar>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-xl"
            onClick={() => navigate('/catalog')}
          >
            Beli Lagi
          </Button>
          <Button
            className="h-12 flex-1 rounded-xl"
            leadingIcon={trackable ? 'local_shipping' : 'receipt_long'}
            onClick={() =>
              trackable
                ? navigate(`/tracking/${order.id}`)
                : push('Ulasan & garansi tersedia di menu Bantuan', 'info')
            }
          >
            {trackable ? 'Lacak Pesanan' : order.status === 'completed' ? 'Beri Ulasan' : 'Booking Ulang'}
          </Button>
        </div>
      </StickyBar>

      <BottomNav />
      <ToastHost />
    </>
  )
}
