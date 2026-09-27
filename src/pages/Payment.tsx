import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { findPromo, paymentOptions } from '../data/checkout'
import { useCart } from '../store/CartContext'
import { useCheckout } from '../store/CheckoutContext'
import { useOrders } from '../store/OrderContext'
import { formatRupiah } from '../utils/format'

/** State simulasi pembayaran: diproses otomatis lalu diverifikasi. */
export function Payment() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { items, total, clear } = useCart()
  const { state } = useCheckout()
  const { create } = useOrders()
  const created = useRef(false)

  const fail = params.get('state') === 'failed'
  const shipping = state.fulfilment === 'pickup' ? 0 : 20_000
  const applied = findPromo(state.promo ?? '')
  const discount = applied && total >= applied.minTotal ? applied.amount : 0
  const grandTotal = total - discount + shipping
  const payment = paymentOptions.find((p) => p.id === state.paymentId) ?? paymentOptions[0]
  const reference = useMemo(
    () => `#OPT-INV-${new Date().getFullYear()}-9481`,
    [],
  )

  useEffect(() => {
    if (items.length === 0 && !created.current) {
      navigate('/cart', { replace: true })
      return
    }
    const timer = window.setTimeout(() => {
      if (fail) {
        navigate('/payment/failed', { replace: true })
        return
      }
      if (created.current) return
      created.current = true
      const order = create({
        items: items.map((i) => ({
          productId: i.productId,
          brand: i.brand,
          name: i.name,
          image: i.image,
          colorName: i.colorName,
          lensName: i.lensName,
          qty: i.qty,
          price: i.price + i.lensPrice,
        })),
        subtotal: total,
        discount,
        shippingCost: shipping,
        total: grandTotal,
        fulfilment: state.fulfilment,
        paymentMethod:
          payment.id === 'bca-va'
            ? 'BCA Virtual Account'
            : payment.id === 'ewallet'
              ? 'E-Wallet'
              : payment.id === 'card'
                ? 'Kartu Debit / Kredit'
                : 'QRIS',
        address: state.fulfilment === 'delivery' ? state.addressId ?? undefined : undefined,
        branchId: state.fulfilment === 'pickup' ? state.branchId ?? undefined : undefined,
      })
      clear()
      navigate(`/payment/success?order=${encodeURIComponent(order.id)}`, { replace: true })
    }, 2800)
    return () => window.clearTimeout(timer)
  }, [items.length, fail, navigate, create, clear, grandTotal, total, discount, shipping, state, payment])

  if (items.length === 0) return null

  return (
    <>
      <PageHeader
        title="Status Transaksi"
        actions={
          <span className="flex items-center gap-1.5 pr-2 text-[11px] font-semibold text-ink-muted">
            <Icon name="lock" size={14} className="text-brand" />
            SSL Encrypted
          </span>
        }
      />

      <main className="flex-1 px-5 pb-24 pt-8">
        <div className="mx-auto max-w-[420px] space-y-4">
          <div className="flex flex-col items-center py-6 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-light text-brand">
              <Icon name="sync" size={40} className="animate-spin" />
            </span>
            <h2 className="mt-5 text-[22px] font-bold text-ink">Memproses pembayaran...</h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              Jangan tutup atau refresh halaman ini.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-muted">Kode Transaksi</span>
              <span className="font-mono text-xs font-bold text-ink">{reference}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-brand-light p-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
                <Icon name="check" size={15} />
              </span>
              <span className="text-xs font-semibold text-brand-dark">Verifikasi</span>
              <span className="ml-auto text-[11px] font-medium text-ink-muted">
                Pembayaran diterima
              </span>
            </div>

            <div className="border-t border-line pt-3">
              <h3 className="text-xs font-bold text-ink">Item Pembelian</h3>
              {items.map((item) => (
                <div key={item.id} className="mt-2 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas p-1">
                    <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-ink">
                      {item.brand} {item.name}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {item.qty}x Frame &amp; Lensa Ophthalmic
                    </p>
                  </div>
                  <span className="text-xs font-bold text-ink">{item.qty}x</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="text-xs font-semibold text-ink-muted">Metode Pembayaran</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <Icon name={payment.icon} size={16} className="text-brand" />
                {payment.name}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="text-xs font-semibold text-ink-muted">Total Tagihan</span>
              <span className="text-[17px] font-bold text-ink">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
            <Icon name="verified_user" size={14} className="text-brand" />
            Sistem pembayaran aman &amp; terenkripsi otomatis.
          </p>
        </div>
      </main>

      <BottomNav />
      <ToastHost />
    </>
  )
}
