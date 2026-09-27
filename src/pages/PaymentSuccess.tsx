import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { useOrders } from '../store/OrderContext'
import { usePrescriptions } from '../store/PrescriptionContext'
import { useToast } from '../store/ToastContext'
import { cn } from '../utils/cn'
import { formatDateFull, formatRupiah } from '../utils/format'

const STEPS = ['Pembayaran', 'Kalibrasi Lab', 'Pengiriman']

export function PaymentSuccess() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { orders, get } = useOrders()
  const { active } = usePrescriptions()
  const { push } = useToast()

  const order = get(params.get('order') ?? undefined) ?? orders[0]

  useEffect(() => {
    if (!order) navigate('/orders', { replace: true })
  }, [order, navigate])
  if (!order) return null

  const frame = order.items[0]
  const lensName = frame?.lensName ?? 'Lensa Ophthalmic'
  const eta = new Date(new Date(order.createdAt).getTime() + 3 * 86_400_000)

  return (
    <>
      <PageHeader
        variant="plain"
        title="Status Pembayaran"
        actions={
          <>
            <IconButton
              name="close"
              label="Tutup"
              onClick={() => navigate('/')}
            />
            <IconButton
              name="help_outline"
              label="Bantuan"
              onClick={() => push('Hubungi OptiCare di 0800-1234', 'info')}
            />
          </>
        }
      />

      <main className="flex-1 px-5 pb-32 pt-6">
        <div className="mx-auto max-w-[460px] space-y-4">
          {/* Status utama */}
          <div className="flex flex-col items-center rounded-xl border border-line bg-surface p-5 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
              <Icon name="check_circle" size={36} />
            </span>
            <span className="mt-3 text-xs font-semibold text-success">
              Transaksi Berhasil diverifikasi
            </span>
            <h2 className="mt-1 text-[22px] font-bold text-ink">Pembayaran Berhasil!</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              Pesananmu sudah kami terima dan akan segera diproses oleh laboratorium optik
              OptiCare.
            </p>
          </div>

          {/* Detail transaksi */}
          <div className="space-y-2.5 rounded-xl border border-line bg-surface p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Order ID</span>
              <span className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-ink">{order.code}</span>
                <button
                  type="button"
                  aria-label="Salin Order ID"
                  onClick={() => {
                    void navigator.clipboard?.writeText(order.code)
                    push('Order ID disalin')
                  }}
                  className="text-ink-muted transition-colors hover:text-brand"
                >
                  <Icon name="content_copy" size={14} />
                </button>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Metode Pembayaran</span>
              <span className="font-semibold text-ink">{order.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Tanggal Transaksi</span>
              <span className="font-semibold text-ink">
                {formatDateFull(order.createdAt)}, 14:30 WIB
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-2.5">
              <span className="font-bold text-ink">Total Pembayaran</span>
              <span className="text-[15px] font-bold text-ink">
                {formatRupiah(order.total)}
              </span>
            </div>
          </div>

          {/* Ringkasan produk */}
          <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
            <h3 className="text-xs font-bold text-ink">Ringkasan Produk</h3>
            <div className="flex gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas p-1">
                <img src={frame?.image} alt={frame?.name} className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-ink">1 Frame Lengkap</span>
                  <span className="text-[11px] text-ink-muted">Qty: {frame?.qty}</span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                  {frame?.brand} {frame?.name} • {frame?.colorName}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-brand">
                  <Icon name="lens" size={14} />
                  {lensName}
                </p>
                {active && (
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-muted">
                    <Icon name="visibility" size={14} />
                    OD {active.od.sph} | OS {active.os.sph}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-brand-light p-2.5">
              <Icon name="science" size={16} className="mt-0.5 shrink-0 text-brand" />
              <div>
                <p className="text-[11px] font-semibold text-ink">
                  Estimasi Selesai: {formatDateFull(eta)}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                  Kami akan memberi notifikasi otomatis ketika kacamata selesai dirakit dan lolos
                  uji presisi lab optik.
                </p>
              </div>
            </div>
          </div>

          {/* Progress langkah */}
          <div className="rounded-xl border border-line bg-surface px-4 py-3">
            <div className="flex items-center gap-1.5">
              {STEPS.map((step, i) => (
                <div key={step} className="flex min-w-0 flex-1 items-center gap-1 last:flex-none">
                  <span
                    className={
                      i === 0
                        ? 'grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand text-white'
                        : 'grid h-4 w-4 shrink-0 place-items-center rounded-full border border-line text-ink-muted'
                    }
                  >
                    {i === 0 && <Icon name="check" size={10} />}
                  </span>
                  <span
                    className={cn(
                      'min-w-0 truncate whitespace-nowrap text-[10.5px]',
                      i === 0 ? 'font-semibold text-ink' : 'font-medium text-ink-muted',
                    )}
                  >
                    {i + 1}. {step}
                  </span>
                  {i < STEPS.length - 1 && <span className="h-px min-w-1 flex-1 bg-line" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <StickyBar>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-xl"
            onClick={() => navigate('/')}
          >
            Kembali ke Home
          </Button>
          <Button
            className="h-12 flex-1 rounded-xl"
            leadingIcon="local_shipping"
            onClick={() => navigate(`/tracking/${order.id}`)}
          >
            Lacak Pesanan
          </Button>
        </div>
      </StickyBar>

      <BottomNav />
      <ToastHost />
    </>
  )
}
