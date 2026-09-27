import { useNavigate } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { paymentOptions } from '../data/checkout'
import { useCart } from '../store/CartContext'
import { useCheckout } from '../store/CheckoutContext'
import { useToast } from '../store/ToastContext'
import { formatRupiah } from '../utils/format'

export function PaymentFailed() {
  const navigate = useNavigate()
  const { items, total } = useCart()
  const { state } = useCheckout()
  const { push } = useToast()

  const frame = items[0]
  const payment = paymentOptions.find((p) => p.id === state.paymentId) ?? paymentOptions[0]

  return (
    <>
      <PageHeader
        title="Status Transaksi"
        actions={
          <IconButton
            name="help_outline"
            label="Bantuan"
            onClick={() => push('Hubungi OptiCare di 0800-1234', 'info')}
          />
        }
      />

      <main className="flex-1 px-5 pb-32 pt-6">
        <div className="mx-auto max-w-[460px] space-y-4">
          <div className="flex flex-col items-center rounded-xl border border-line bg-surface p-5 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-error/10 text-error">
              <Icon name="error_outline" size={36} />
            </span>
            <h2 className="mt-3 text-[22px] font-bold text-ink">Pembayaran Belum Berhasil</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              Tidak ada dana yang dipotong. Silakan coba kembali atau pilih metode pembayaran
              lain.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-ink-muted">Nomor Referensi</span>
              <span className="font-mono font-bold text-ink">#OPT-INV-2026-9481</span>
            </div>
          </div>

          {/* Item gagal */}
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between pb-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                {frame?.brand ?? 'Ray-Ban Optical'}
              </span>
              <span className="flex items-center gap-1 rounded-md bg-error/10 px-2 py-0.5 text-[11px] font-semibold text-error">
                <Icon name="error" size={13} />
                Gagal Diproses
              </span>
            </div>
            <div className="flex gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas p-1">
                <img
                  src={frame?.image}
                  alt={frame?.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{frame?.name}</p>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  {frame?.qty}x {frame?.lensName ?? 'Frame & Lensa Blue Light'} • Qty:{' '}
                  {frame?.qty}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-success">
                  <Icon name="visibility" size={14} />
                  Resep Optical R/L Valid
                </p>
                <p className="mt-1 text-sm font-bold text-ink">
                  {formatRupiah(frame ? frame.price * frame.qty : 1_950_000)}
                </p>
              </div>
            </div>
          </div>

          {/* Metode & penyebab */}
          <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-muted">Metode Percobaan</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <Icon name={payment.icon} size={16} className="text-brand" />
                {payment.name}
              </span>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-2.5">
              <Icon name="timer" size={16} className="mt-0.5 shrink-0 text-warning" />
              <div>
                <p className="text-[11px] font-semibold text-ink">Penyebab:</p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                  Waktu transaksi berakhir (Timeout) atau koneksi terputus.
                </p>
              </div>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <div>
                <span className="block text-xs font-bold text-ink">Total Tagihan</span>
                <span className="text-[11px] text-ink-muted">
                  Termasuk PPN &amp; Biaya Pengiriman
                </span>
              </div>
              <span className="text-[17px] font-bold text-ink">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Keamanan */}
          <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-light text-brand">
              <Icon name="shield" size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-ink">Keamanan Transaksi Terjamin</p>
              <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                Pesanan Anda tersimpan aman. Transaksi belum tercatat dan Anda dapat mengulang
                proses tanpa membuat ulang pesanan.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => push('Membuka pusat bantuan OptiCare', 'info')}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Bantuan Pembayaran
            </button>
          </div>
        </div>
      </main>

      <StickyBar>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-xl"
            leadingIcon="credit_card"
            onClick={() => navigate('/checkout')}
          >
            Ganti Metode
          </Button>
          <Button
            className="h-12 flex-1 rounded-xl"
            leadingIcon="refresh"
            onClick={() => navigate('/payment', { replace: true })}
          >
            Coba Lagi
          </Button>
        </div>
      </StickyBar>

      <BottomNav />
      <ToastHost />
    </>
  )
}
