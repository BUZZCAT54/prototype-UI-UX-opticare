import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Section } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { ProductCard } from '../components/product/ProductCard'
import { BottomSheet } from '../components/ui/BottomSheet'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { useProfile } from '../store/ProfileContext'
import { products, SHAPE_LABEL } from '../data/products'
import { promos } from '../data/checkout'
import type { FrameShape } from '../types'
import { formatRupiah } from '../utils/format'
import { cn } from '../utils/cn'

const SERVICES: { label: string; icon: string; to: string }[] = [
  { label: 'Frame', icon: 'filter_frames', to: '/catalog' },
  { label: 'Lens', icon: 'lens', to: '/lens-selection' },
  { label: 'Eye Check', icon: 'remove_red_eye', to: '/booking' },
  { label: 'Promo', icon: 'sell', to: '#promo' },
]

const SHAPES: (FrameShape | 'all')[] = [
  'all',
  'square',
  'round',
  'aviator',
  'cat-eye',
  'rectangle',
]

function greetingFor(date = new Date()) {
  const hour = date.getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export function Home() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const firstName = profile.name.split(' ')[0]
  const [query, setQuery] = useState('')
  const [shape, setShape] = useState<FrameShape | 'all'>('all')
  const [promoOpen, setPromoOpen] = useState(false)

  const recommended = useMemo(
    () => (shape === 'all' ? products.slice(0, 4) : products.filter((p) => p.shape === shape)),
    [shape],
  )

  return (
    <>
      <PageHeader variant="brand" showNotification showCart />

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {/* Greeting */}
        <section className="px-5 pb-3 pt-2">
          <h1 className="text-[20px] font-bold leading-tight text-ink">
            {greetingFor()}, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">
            Jaga penglihatanmu dan temukan kacamata yang cocok hari ini.
          </p>
        </section>

        {/* Search */}
        <section className="mb-4 px-5">
          <form
            className="flex h-12 w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 shadow-card"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/catalog${query ? `?q=${encodeURIComponent(query)}` : ''}`)
            }}
          >
            <Icon name="search" size={20} className="text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari frame, lensa, atau layanan..."
              aria-label="Cari frame, lensa, atau layanan"
              className="w-full min-w-0 border-none bg-transparent p-0 text-[13px] text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button
              type="button"
              aria-label="Filter pencarian"
              onClick={() => navigate('/catalog')}
              className="p-1 text-ink-muted transition-colors hover:text-brand"
            >
              <Icon name="tune" size={18} />
            </button>
          </form>
        </section>

        {/* Hero */}
        <section className="mb-5 px-5">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
              <img
                src="/images/home-hero-3.jpg"
                alt="Potret editorial orang mengenakan frame titanium minimal OptiCare"
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            </div>
            <div className="bg-surface p-4">
              <span className="mb-1.5 inline-block rounded-full bg-brand-light px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
                Koleksi Terbaru
              </span>
              <h2 className="text-[17px] font-bold leading-snug text-ink">
                Lihat Lebih Jelas. Hidup Lebih Nyaman.
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Temukan frame yang sesuai dengan gaya dan kebutuhan penglihatanmu.
              </p>
              <Button
                fullWidth
                size="lg"
                className="mt-3.5 h-10 rounded-[10px] text-[13px]"
                trailingIcon="arrow_forward"
                onClick={() => navigate('/catalog')}
              >
                Lihat Koleksi
              </Button>
            </div>
          </div>
        </section>

        {/* Layanan */}
        <Section title="Layanan OptiCare" className="mb-5">
          <div className="grid grid-cols-4 gap-2.5">
            {SERVICES.map((svc) => (
              <button
                key={svc.label}
                type="button"
                onClick={() => (svc.to === '#promo' ? setPromoOpen(true) : navigate(svc.to))}
                className="group flex flex-col items-center gap-1.5"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-brand/15 bg-brand-light text-brand transition-transform group-active:scale-95">
                  <Icon name={svc.icon} size={26} />
                </span>
                <span className="text-center text-xs font-medium text-ink">{svc.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Bentuk frame */}
        <section className="mb-5">
          <div className="mb-2.5 px-5">
            <h3 className="text-[15px] font-bold text-ink">Cari Berdasarkan Bentuk</h3>
          </div>
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-5">
            {SHAPES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={shape === s}
                onClick={() => setShape(s)}
                className={cn(
                  'shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition',
                  shape === s
                    ? 'bg-brand text-white'
                    : 'border border-line bg-surface text-ink-muted hover:border-brand/50',
                )}
              >
                {s === 'all' ? 'Semua' : SHAPE_LABEL[s]}
              </button>
            ))}
          </div>
        </section>

        {/* Rekomendasi */}
        <Section
          title="Rekomendasi untuk Kamu"
          className="mb-5"
          action={
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="text-[13px] font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              Lihat Semua
            </button>
          }
        >
          {recommended.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {recommended.map((p) => (
                <ProductCard key={p.id} product={p} variant="home" />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-6 text-center">
              <p className="text-sm font-semibold text-ink">Belum ada frame bentuk ini</p>
              <p className="mt-1 text-xs text-ink-muted">Coba bentuk lain untuk melihat rekomendasi.</p>
              <Chip className="mt-3" active={false} onClick={() => setShape('all')}>
                Lihat semua bentuk
              </Chip>
            </div>
          )}
        </Section>

        {/* Promo */}
        <section className="mb-6 px-5">
          <div className="overflow-hidden rounded-2xl border border-brand/25 bg-brand-light p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
                  Promo Bulan Ini
                </span>
                <h3 className="mt-2 text-[15px] font-bold text-ink">
                  Diskon Rp100.000 untuk transaksi pertama
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  Pakai kode <span className="font-bold text-brand-dark">OPTICARE10</span> di
                  keranjang, minimum belanja Rp500.000.
                </p>
              </div>
              <Icon name="sell" size={32} className="shrink-0 text-brand" fill />
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="rounded-[10px]" onClick={() => setPromoOpen(true)}>
                Lihat Promo
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-[10px]"
                onClick={() => navigate('/catalog')}
              >
                Belanja Sekarang
              </Button>
            </div>
          </div>
        </section>
      </main>

      <BottomSheet open={promoOpen} onClose={() => setPromoOpen(false)} title="Promo Aktif">
        <div className="flex flex-col gap-3">
          {promos.map((promo) => (
            <div
              key={promo.code}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas p-4"
            >
              <div className="min-w-0">
                <span className="block text-[13px] font-bold text-brand-dark">{promo.code}</span>
                <p className="mt-0.5 text-xs text-ink-muted">{promo.description}</p>
                <p className="mt-1 text-[11px] text-ink-muted">
                  Min. belanja {formatRupiah(promo.minTotal)} · Berlaku hari ini
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setPromoOpen(false)
                  navigate('/cart')
                }}
              >
                Pakai
              </Button>
            </div>
          ))}
          <p className="text-center text-[11px] text-ink-muted">
            Kode otomatis tersimpan di keranjang saat kamu menekan “Pakai”.
          </p>
        </div>
      </BottomSheet>

      <BottomNav />
      <ToastHost />
    </>
  )
}
