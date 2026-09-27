import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { ORDER_STAGES, getStatusMeta } from '../data/orders'
import { useOrders } from '../store/OrderContext'
import { usePrescriptions } from '../store/PrescriptionContext'
import { useProfile } from '../store/ProfileContext'
import { useToast } from '../store/ToastContext'
import { cn } from '../utils/cn'
import { formatDateFull, formatRupiah } from '../utils/format'

const dayMonth = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
const clock = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' })

function timelineLabel(iso: string): string {
  const d = new Date(iso)
  return `${dayMonth.format(d)} · ${clock.format(d).replace('.', ':')} WIB`
}

export function OrderTracking() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { get } = useOrders()
  const { active } = usePrescriptions()
  const { profile } = useProfile()
  const { push } = useToast()
  const [showDetail, setShowDetail] = useState(true)

  const order = get(id)

  const currentStageIndex = useMemo(() => {
    if (!order) return -1
    if (order.status === 'cancelled') return -1
    const idx = ORDER_STAGES.findIndex((s) => s.id === order.status)
    return idx === -1 ? 0 : idx
  }, [order])

  if (!order) {
    return (
      <>
        <PageHeader title="Status Pesanan" />
        <main className="flex flex-1 items-center justify-center px-5 text-center">
          <p className="text-sm text-ink-muted">Pesanan tidak ditemukan.</p>
        </main>
        <BottomNav />
        <ToastHost />
      </>
    )
  }

  const meta = getStatusMeta(order.status)
  const item = order.items[0]
  const eta = new Date(new Date(order.createdAt).getTime() + 3 * 86_400_000)
  const daysLeft = Math.max(
    Math.ceil((eta.getTime() - Date.now()) / 86_400_000),
    0,
  )
  const eventFor = (status: string) => order.timeline.find((t) => t.status === status)

  return (
    <>
      <PageHeader
        title="Status Pesanan"
        actions={
          <IconButton
            name="help_outline"
            label="Bantuan"
            onClick={() => push('Optometris kami siap sedia 08.00 – 21.00 WIB', 'info')}
          />
        }
      />

      <main className="flex-1 space-y-4 px-5 pb-8 pt-4">
        {/* Status kepala */}
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-ink-muted">Nomor Pesanan</span>
            <span className="font-mono text-sm font-bold text-ink">{order.code}</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-canvas p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-light text-brand">
              <Icon name={meta.icon} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">
                {order.status === 'lens-processing' ? 'Sedang Dibuat' : meta.label}
              </p>
              <p className="text-[11px] text-ink-muted">Perkiraan Waktu Siap</p>
              <p className="text-[11px] font-semibold text-ink">
                Estimasi selesai {formatDateFull(eta)}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-brand-light px-2 py-1 text-[11px] font-bold text-brand">
              {daysLeft > 0 ? `${daysLeft} Hari Lagi` : 'Hari Ini'}
            </span>
          </div>
        </div>

        {/* Produk */}
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas p-1">
              <img src={item?.image} alt={item?.name} className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center justify-between text-[11px] font-semibold text-ink-muted">
                <span>{item?.brand}</span>
                <span>Qty: {item?.qty}</span>
              </p>
              <p className="mt-0.5 text-sm font-bold text-ink">{item?.name}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {item?.colorName}
                {item?.lensName ? ` · Lensa ${item.lensName}` : ''}
              </p>
              <div className="mt-2 border-t border-line pt-2">
                <p className="text-[11px] text-ink-muted">Total Pembayaran</p>
                <p className="text-[15px] font-bold text-ink">{formatRupiah(order.total)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progres lab */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <h3 className="text-xs font-bold text-ink">Riwayat &amp; Progres Lab</h3>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            Pembaruan otomatis dari optik laboratorium
          </p>

          <div className="mt-3 space-y-0">
            {ORDER_STAGES.map((stage, i) => {
              const event = eventFor(stage.id)
              const state =
                order.status === 'cancelled'
                  ? 'future'
                  : i < currentStageIndex
                    ? 'done'
                    : i === currentStageIndex
                      ? 'active'
                      : 'future'
              return (
                <div key={stage.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-full',
                        state === 'done' && 'bg-brand text-white',
                        state === 'active' && 'border-2 border-brand bg-brand-light text-brand',
                        state === 'future' && 'border border-line-input text-line-input',
                      )}
                    >
                      <Icon name={state === 'done' ? 'check' : stage.icon} size={15} />
                    </span>
                    {i < ORDER_STAGES.length - 1 && (
                      <span
                        className={cn(
                          'my-1 w-px flex-1',
                          state === 'done' ? 'bg-brand/40' : 'bg-line',
                        )}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'text-xs',
                          state === 'future'
                            ? 'font-medium text-ink-muted'
                            : 'font-bold text-ink',
                        )}
                      >
                        {stage.label}
                      </span>
                      {state === 'active' && (
                        <span className="rounded-md bg-brand-light px-1.5 py-0.5 text-[10px] font-bold text-brand">
                          Aktif
                        </span>
                      )}
                      {state === 'done' && stage.id === 'confirmed' && (
                        <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                          Terverifikasi Otomatis
                        </span>
                      )}
                      {state === 'future' && (
                        <span className="text-[10px] font-semibold text-ink-muted">
                          Tahap {i + 1}
                        </span>
                      )}
                    </div>
                    {event && (
                      <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
                        {timelineLabel(event.at)}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] leading-snug text-ink-muted">
                      {state === 'active' && stage.id === 'lens-processing' ? (
                        <>
                          {event?.note ?? stage.description}
                          {active && (
                            <span className="mt-1.5 flex gap-3 rounded-md bg-canvas p-2 text-[11px]">
                              <span className="text-ink-muted">
                                OD (Kanan) <span className="font-mono font-bold text-ink">{active.od.sph}</span>
                              </span>
                              <span className="text-ink-muted">
                                OS (Kiri) <span className="font-mono font-bold text-ink">{active.os.sph}</span>
                              </span>
                            </span>
                          )}
                        </>
                      ) : (
                        (event?.note ?? stage.description)
                      )}
                    </p>
                  </div>
                </div>
              )
            })}

            {order.status === 'cancelled' && (
              <div className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-error text-white">
                  <Icon name="cancel" size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-ink">Pesanan Dibatalkan</span>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                    {eventFor('cancelled')?.note ?? 'Dana dikembalikan sesuai metode pembayaran.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Detail pesanan & resep */}
        <section className="rounded-xl border border-line bg-surface">
          <button
            type="button"
            onClick={() => setShowDetail((v) => !v)}
            aria-expanded={showDetail}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <Icon name="receipt_long" size={17} className="text-brand" />
                Detail Pesanan &amp; Resep
              </span>
              <span className="mt-0.5 block text-[11px] text-ink-muted">
                Spesifikasi frame, resep medis, dan alamat
              </span>
            </span>
            <Icon
              name="expand_more"
              size={18}
              className={cn('text-ink-muted transition-transform', !showDetail && '-rotate-90')}
            />
          </button>

          {showDetail && (
            <div className="space-y-4 border-t border-line p-4 pt-3.5">
              {/* Resep */}
              <div>
                <p className="flex items-center justify-between text-xs font-bold text-ink">
                  <span className="flex items-center gap-1.5">
                    <Icon name="lens" size={16} className="text-brand" />
                    Resep Lensa (OD / OS)
                  </span>
                  <span className="text-[11px] font-semibold text-ink-muted">
                    PD: {active?.od.pd ?? '63'} mm
                  </span>
                </p>
                <div className="mt-2 space-y-1.5 rounded-lg border border-line bg-canvas p-2.5">
                  <div className="grid grid-cols-4 border-b border-line pb-1 text-center text-[11px] font-semibold text-ink-muted">
                    <span className="text-left">Mata</span>
                    <span>SPH</span>
                    <span>CYL</span>
                    <span>AXIS</span>
                  </div>
                  {(
                    [
                      ['OD', '(Kanan)', active?.od],
                      ['OS', '(Kiri)', active?.os],
                    ] as const
                  ).map(([code, side, eye], i) =>
                    eye ? (
                      <div
                        key={code}
                        className={cn(
                          'grid grid-cols-4 items-center pt-0.5 text-xs font-medium text-ink',
                          i === 1 && 'border-t border-line pt-1.5',
                        )}
                      >
                        <span className="flex items-center gap-1 text-left font-bold text-brand">
                          {code}{' '}
                          <span className="text-[10px] font-normal text-ink-muted">{side}</span>
                        </span>
                        <span className="text-center font-mono">{eye.sph}</span>
                        <span className="text-center font-mono">{eye.cyl}</span>
                        <span className="text-center font-mono">{eye.axis}°</span>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>

              {/* Alamat / cabang */}
              <div className="border-t border-line pt-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <Icon name="pin_drop" size={16} className="text-brand" />
                  {order.fulfilment === 'pickup' ? 'Cabang Pengambilan' : 'Alamat Pengiriman'}
                </p>
                <p className="mt-1 text-xs font-semibold text-ink">{profile.name}</p>
                <p className="text-[11px] text-ink-muted">{profile.phone}</p>
                <p className="mt-0.5 text-xs leading-snug text-ink-muted">
                  {order.address ??
                    'OptiCare Padang · Jl. Khatib Sulaiman No. 18, Lolong Belanti, Kota Padang'}
                </p>
                <p className="mt-1.5 text-[11px] text-ink-muted">
                  Kurir: <span className="font-semibold text-ink">{order.courier ?? 'Ambil di Optik'}</span>
                </p>
              </div>

              {/* Pembayaran */}
              <div className="space-y-2 border-t border-line pt-3 text-xs">
                <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <Icon name="credit_card" size={16} className="text-brand" />
                  Informasi Pembayaran
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Harga Produk &amp; Lensa</span>
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
                  <span className="text-ink-muted">Ongkos Kirim</span>
                  <span className="font-semibold text-ink">
                    {order.shippingCost === 0 ? 'Gratis' : formatRupiah(order.shippingCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Metode Pembayaran</span>
                  <span className="font-semibold text-ink">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2">
                  <span className="font-bold text-ink">Total Bayar</span>
                  <span className="text-[15px] font-bold text-ink">
                    {formatRupiah(order.total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Bantuan */}
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-light text-brand">
            <Icon name="support_agent" size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink">Butuh bantuan dengan pesananmu?</p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              Optometris kami siap sedia 08.00 – 21.00 WIB
            </p>
          </div>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => push('Menghubungkan ke OptiCare...', 'info')}>
            Hubungi
          </Button>
        </div>

        <div className="flex gap-2 pb-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => navigate('/orders')}
          >
            Semua Pesanan
          </Button>
          <Button className="flex-1 rounded-xl" onClick={() => navigate(`/orders/${order.id}`)}>
            Detail Pesanan
          </Button>
        </div>
      </main>

      <BottomNav />
      <ToastHost />
    </>
  )
}
