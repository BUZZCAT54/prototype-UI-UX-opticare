import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { EmptyState, Tabs } from '../components/ui/Field'
import { ToastHost } from '../components/ui/Toast'
import { ORDER_TABS, getStatusMeta } from '../data/orders'
import { useOrders } from '../store/OrderContext'
import type { Order } from '../types'
import { cn } from '../utils/cn'
import { formatDateFull, formatRupiah } from '../utils/format'

type TabId = 'all' | 'lens-processing' | 'shipping' | 'completed'

const STATUS_STYLE: Record<Order['status'], string> = {
  confirmed: 'bg-brand-light text-brand',
  'lens-processing': 'bg-brand-light text-brand',
  'quality-check': 'bg-brand-light text-brand',
  shipping: 'bg-warning/15 text-warning',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-error/10 text-error',
}

const TAB_FILTER: Record<TabId, Order['status'] | 'all'> = {
  all: 'all',
  'lens-processing': 'lens-processing',
  shipping: 'shipping',
  completed: 'completed',
}

export function Orders() {
  const navigate = useNavigate()
  const { orders } = useOrders()
  const [tab, setTab] = useState<TabId>('all')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const counts = useMemo(
    () => ({
      all: orders.length,
      'lens-processing': orders.filter((o) =>
        ['confirmed', 'lens-processing', 'quality-check'].includes(o.status),
      ).length,
      shipping: orders.filter((o) => o.status === 'shipping').length,
      completed: orders.filter((o) => o.status === 'completed').length,
    }),
    [orders],
  )

  const filtered = orders.filter((order) => {
    const status = TAB_FILTER[tab]
    const matchTab =
      status === 'all' ||
      (status === 'lens-processing'
        ? ['confirmed', 'lens-processing', 'quality-check'].includes(order.status)
        : order.status === status)
    const q = query.trim().toLowerCase()
    const matchQuery =
      !q ||
      order.code.toLowerCase().includes(q) ||
      order.items.some((i) => `${i.brand} ${i.name}`.toLowerCase().includes(q))
    return matchTab && matchQuery
  })

  return (
    <>
      <PageHeader
        variant="plain"
        title="Pesanan Saya"
        subtitle="Lihat dan pantau semua pesanan OptiCare kamu"
        actions={
          <>
            <IconButton
              name="support_agent"
              label="Bantuan"
              onClick={() => navigate('/profile')}
            />
            <IconButton
              name={searching ? 'close' : 'search'}
              label="Cari pesanan"
              active={searching}
              onClick={() => {
                setSearching((s) => !s)
                setQuery('')
              }}
            />
          </>
        }
      />

      <main className="flex-1 space-y-4 px-5 pb-24 pt-4">
        {searching && (
          <div className="relative">
            <Icon
              name="search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nomor pesanan atau produk"
              aria-label="Cari pesanan"
              className="h-11 w-full rounded-xl border border-line-input bg-surface pl-9 pr-3.5 text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        )}

        <Tabs
          items={ORDER_TABS.map((t) => ({ id: t.id as TabId, label: t.label, count: counts[t.id as TabId] }))}
          value={tab}
          onChange={setTab}
        />

        {orders.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="Belum ada pesanan"
            description="Pesanan kacamata atau lensa yang kamu buat akan muncul di sini. Mulai temukan frame yang cocok untukmu."
            action={
              <Button
                className="mt-4 rounded-xl"
                trailingIcon="arrow_forward"
                onClick={() => navigate('/catalog')}
              >
                Mulai Belanja
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="Pesanan tidak ditemukan"
            description="Coba ubah kata kunci atau tab filter untuk menemukan pesananmu."
            action={
              <Button
                className="mt-4 rounded-xl"
                variant="outline"
                onClick={() => {
                  setQuery('')
                  setTab('all')
                }}
              >
                Tampilkan Semua
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface p-3.5">
          <Icon name="verified" size={18} className="mt-0.5 shrink-0 text-brand" />
          <div>
            <p className="text-xs font-bold text-ink">Garansi Adaptasi Lensa 30 Hari</p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
              Penyesuaian resep OD/OS gratis jika lensa terasa tidak nyaman.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
      <ToastHost />
    </>
  )
}

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate()
  const meta = getStatusMeta(order.status)
  const item = order.items[0]
  const stageNumber = Math.max(meta.stage, 1)
  const eta = formatDateFull(new Date(new Date(order.createdAt).getTime() + 3 * 86_400_000))
  const cancelled = order.status === 'cancelled'

  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2 pb-2.5">
        <div>
          <p className="font-mono text-xs font-bold text-ink">{order.code}</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">{formatDateFull(order.createdAt)}</p>
        </div>
        <span
          className={cn(
            'flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold',
            STATUS_STYLE[order.status],
          )}
        >
          <Icon name={meta.icon} size={13} />
          {order.status === 'lens-processing' ? 'Sedang Dibuat' : meta.shortLabel}
        </span>
      </div>

      <div className="flex gap-3 border-t border-line pt-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas p-1">
          <img src={item?.image} alt={item?.name} className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {item?.brand} {item?.name}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-ink-muted">
            {item?.colorName}
            {item?.lensName ? ` • ${item.lensName}` : ' • Frame Only'}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Qty: {item?.qty} pasang</p>
        </div>
      </div>

      {/* Status detail */}
      <div className="mt-3 space-y-1 rounded-lg bg-canvas p-2.5 text-[11px] leading-snug text-ink-muted">
        {order.status === 'cancelled' ? (
          <>
            <p>Dibatalkan oleh pembeli • Dana telah dikembalikan</p>
            <p className="flex items-center justify-between pt-1 font-semibold text-ink">
              Pengembalian <span className="text-success">{formatRupiah(order.total)}</span>
            </p>
            <p className="text-[10px] text-success">(Refund Selesai)</p>
          </>
        ) : order.status === 'completed' ? (
          <>
            <p>
              {order.fulfilment === 'pickup'
                ? 'Diambil di OptiCare Padang pada 8 Sep 2026'
                : 'Diterima oleh Budi (Penerima) pada 8 Sep 2026'}
            </p>
            <p className="flex items-center justify-between pt-1">
              <span className="text-ink">Total Transaksi</span>
              <span className="text-ink">{formatRupiah(order.total)}</span>
            </p>
          </>
        ) : order.status === 'shipping' ? (
          <>
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <Icon name="local_shipping" size={14} className="text-brand" />
              {order.courier} ({order.resi})
            </p>
            <p>Kurir sedang menuju alamat • Estimasi tiba hari ini</p>
            <p className="flex items-center justify-between pt-1">
              <span className="text-ink">Total Tagihan</span>
              <span className="text-ink">{formatRupiah(order.total)}</span>
            </p>
          </>
        ) : (
          <>
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <Icon name="precision_manufacturing" size={14} className="text-brand" />
              Lab Optik
            </p>
            <p>
              Tahap {stageNumber} dari 6: {meta.label} — pengerjaan presisi di lab optik
              (Estimasi siap {eta})
            </p>
            <p className="flex items-center justify-between pt-1">
              <span className="text-ink">Total Tagihan</span>
              <span className="text-ink">{formatRupiah(order.total)}</span>
            </p>
          </>
        )}
      </div>

      {/* Aksi */}
      <div className="mt-3 flex gap-2">
        {!cancelled && order.status !== 'completed' && (
          <Button
            size="sm"
            className="flex-1 rounded-lg"
            leadingIcon="local_shipping"
            onClick={() => navigate(`/tracking/${order.id}`)}
          >
            Lacak Pesanan
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-lg"
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          {order.status === 'cancelled' ? 'Lihat Detail' : 'Detail'}
        </Button>
        {order.status === 'completed' && (
          <Button
            size="sm"
            variant="quiet"
            className="rounded-lg"
            leadingIcon="repeat"
            onClick={() => navigate('/catalog')}
          >
            Beli Lagi
          </Button>
        )}
      </div>
    </article>
  )
}
