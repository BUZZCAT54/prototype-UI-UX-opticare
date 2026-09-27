import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { BottomSheet } from '../components/ui/BottomSheet'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { EmptyState } from '../components/ui/Field'
import { getProduct, GENDER_LABEL, SHAPE_LABEL } from '../data/products'
import { lensOptions } from '../data/lenses'
import { useCart } from '../store/CartContext'
import { useFavorites } from '../store/FavoritesContext'
import { useToast } from '../store/ToastContext'
import { formatRupiah } from '../utils/format'
import { cn } from '../utils/cn'

export function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = getProduct(id)
  const { add } = useCart()
  const { has, toggle } = useFavorites()
  const { push } = useToast()

  const [colorIdx, setColorIdx] = useState(0)
  const [imgIdx, setImgIdx] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [sizeOpen, setSizeOpen] = useState(false)

  useEffect(() => {
    setColorIdx(0)
    setImgIdx(0)
  }, [id])

  const compatible = useMemo(
    () => (product ? lensOptions.filter((l) => product.compatibleLenses.includes(l.id)) : []),
    [product],
  )

  if (!product) {
    return (
      <>
        <PageHeader title="Detail Produk" />
        <main className="flex-1 pb-28">
          <EmptyState
            icon="search_off"
            title="Produk tidak ditemukan"
            description="Frame yang kamu cari mungkin sudah tidak tersedia."
            action={
              <Button className="mt-4" onClick={() => navigate('/catalog')}>
                Kembali ke Katalog
              </Button>
            }
          />
        </main>
        <BottomNav />
        <ToastHost />
      </>
    )
  }

  const color = product.colors[colorIdx] ?? product.colors[0]
  const favActive = has(product.id)
  const specs = product.specs

  function addToCart() {
    add({
      productId: product!.id,
      brand: product!.brand,
      name: product!.name,
      image: product!.images[0],
      colorId: color.id,
      colorName: color.name,
      price: product!.price,
      lensId: null,
      lensName: null,
      lensPrice: 0,
    })
    push(`${product!.name} ditambahkan ke keranjang`)
  }

  return (
    <>
      <PageHeader
        title="Detail Produk"
        showCart
        actions={
          <IconButton
            name="favorite"
            label={favActive ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
            active={favActive}
            onClick={() => toggle(product.id)}
          />
        }
      />

      <main className="flex-1 overflow-y-auto pb-32">
        {/* Gallery */}
        <section className="relative flex w-full flex-col items-center border-b border-line bg-canvas">
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={() => push('Virtual Try-On akan segera hadir', 'info')}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 shadow-card transition-colors active:scale-95"
            >
              <Icon name="view_in_ar" size={18} className="text-brand" />
              <span className="text-xs font-semibold text-ink">Virtual Try-On</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="flex aspect-4/3 w-full items-center justify-center overflow-hidden p-6"
            aria-label="Buka galeri gambar"
          >
            <img
              src={product.images[imgIdx]}
              alt={`${product.brand} ${product.name} — tampilan ${imgIdx + 1}`}
              className="h-full w-full object-contain"
            />
          </button>
          <div className="flex items-center gap-1.5 pb-4">
            {product.images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Gambar ${i + 1}`}
                onClick={() => setImgIdx(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === imgIdx ? 'w-6 bg-brand' : 'w-1.5 bg-line',
                )}
              />
            ))}
          </div>
        </section>

        <div className="space-y-6 px-5 pt-5">
          {/* Identity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-widest text-ink-muted">
                {product.brand.toUpperCase()}
              </span>
              <span className="rounded-lg bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
                {product.stock > 0 ? 'Stok Tersedia' : 'Habis'}
              </span>
            </div>
            <h2 className="text-[22px] font-bold leading-tight text-ink">{product.name}</h2>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="flex items-center gap-1 text-warning">
                <Icon name="star" size={18} fill />
                <span className="text-sm font-bold text-ink">{product.rating.toFixed(1)}</span>
              </span>
              <span className="text-xs text-ink-muted">({product.reviews} ulasan)</span>
              <span className="text-xs text-line">•</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-success">
                <Icon name="verified" size={16} />
                100% Original
              </span>
            </div>
            <div className="pt-2">
              <div className="text-[28px] font-bold leading-9 tracking-tight text-brand">
                {formatRupiah(product.price)}
              </div>
              <p className="mt-0.5 text-xs text-ink-muted">
                Harga termasuk frame standar &amp; hard case original.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-line" />

          {/* Warna */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Pilih Warna</span>
              <span className="text-xs font-medium text-brand">{color.name}</span>
            </div>
            <div className="flex gap-3">
              {product.colors.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.name}
                  aria-pressed={i === colorIdx}
                  onClick={() => setColorIdx(i)}
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-full p-0.5 transition-all',
                    i === colorIdx
                      ? 'ring-2 ring-brand ring-offset-2 ring-offset-surface'
                      : 'border border-line hover:border-line-input',
                  )}
                >
                  <span
                    className="flex h-full w-full items-center justify-center rounded-full"
                    style={{ backgroundColor: c.hex }}
                  >
                    {i === colorIdx && <Icon name="check" size={16} className="text-white" />}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-line" />

          {/* Ukuran */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Ukuran Frame</h3>
              <button
                type="button"
                onClick={() => setSizeOpen(true)}
                className="flex items-center gap-0.5 text-xs font-medium text-brand"
              >
                <Icon name="straighten" size={16} />
                Panduan Ukuran
              </button>
            </div>
            <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold tracking-wide text-ink">
                  {specs.lensWidth} — {specs.bridge} — {specs.temple} mm
                </span>
                <span className="rounded bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand-dark">
                  {specs.fit}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-line pt-2 text-center">
                {[
                  { label: 'Lebar Lensa', value: `${specs.lensWidth} mm` },
                  { label: 'Bridge', value: `${specs.bridge} mm` },
                  { label: 'Gagang', value: `${specs.temple} mm` },
                ].map((s, i) => (
                  <div key={s.label} className={cn('space-y-1', i === 1 && 'border-x border-line')}>
                    <span className="block text-xs text-ink-muted">{s.label}</span>
                    <span className="block text-sm font-semibold text-ink">{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-ink-muted">
                <Icon name="info" size={16} className="text-brand" />
                <span className="text-xs">
                  Cocok untuk siluet wajah {specs.fit.replace(' Fit', '').toLowerCase()} hingga oval.
                </span>
              </div>
            </div>
          </div>

          {/* Lensa kompatibel */}
          <section className="space-y-3 rounded-xl border border-brand/25 bg-brand-light/60 p-4">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-brand shadow-sm">
                <Icon name="visibility" size={18} />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-ink">Kompatibel dengan Semua Jenis Lensa</h4>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                  Pilih jenis lensa dan masukkan resep dokter (OD/OS) pada tahap berikutnya.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {compatible.map((l) => (
                <span
                  key={l.id}
                  className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-brand"
                >
                  {l.name}
                </span>
              ))}
            </div>
          </section>

          {/* Deskripsi */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-ink">Tentang Frame Ini</h3>
            <p className="text-sm leading-relaxed text-ink-muted">{product.description}</p>
          </div>

          <div className="h-px w-full bg-line" />

          {/* Spesifikasi */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-ink">Spesifikasi Detail</h3>
            <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {[
                ['Material Frame', product.material],
                ['Bentuk Frame', SHAPE_LABEL[product.shape]],
                ['Gender', GENDER_LABEL[product.gender]],
                ['Stok', `${product.stock} pcs`],
                ['Kode Produk', product.id.toUpperCase()],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5',
                    i % 2 === 0 ? 'bg-surface' : 'bg-canvas',
                  )}
                >
                  <span className="text-xs text-ink-muted">{k}</span>
                  <span
                    className={cn(
                      'text-xs font-semibold text-ink',
                      k === 'Kode Produk' && 'font-mono',
                    )}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Garansi */}
          <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas p-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
              <Icon name="workspace_premium" size={18} />
            </span>
            <p className="text-xs leading-relaxed text-ink-muted">
              Garansi servis bingkai 12 bulan &amp; jaminan akurasi resep optik OptiCare.
            </p>
          </div>
        </div>
      </main>

      {/* CTA */}
      <StickyBar>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Tambah ke Keranjang"
            onClick={addToCart}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line-input bg-surface text-brand transition-all active:scale-95"
          >
            <Icon name="add_shopping_cart" size={22} />
          </button>
          <Button
            fullWidth
            size="lg"
            className="h-12 rounded-xl"
            trailingIcon="arrow_forward"
            onClick={() => navigate(`/lens-selection?product=${product.id}&color=${color.id}`)}
          >
            Pilih Lensa
          </Button>
        </div>
      </StickyBar>

      {/* Size guide */}
      <BottomSheet open={sizeOpen} onClose={() => setSizeOpen(false)} title="Panduan Ukuran">
        <div className="space-y-4 text-sm text-ink-muted">
          <p className="leading-relaxed">
            Angka pada label frame dibaca berurutan: lebar lensa — lebar bridge — panjang gagang,
            dalam satuan milimeter.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Lebar Lensa', `${specs.lensWidth} mm`],
              ['Bridge', `${specs.bridge} mm`],
              ['Gagang', `${specs.temple} mm`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-canvas p-3">
                <span className="block text-[11px] text-ink-muted">{k}</span>
                <span className="mt-1 block text-sm font-bold text-ink">{v}</span>
              </div>
            ))}
          </div>
          <p className="leading-relaxed">
            Ukuran <span className="font-semibold text-ink">{specs.fit}</span> cocok untuk lebar
            wajah sedang. Butuh bantuan? Booking pemeriksaan mata gratis di cabang OptiCare.
          </p>
          <Button
            fullWidth
            variant="secondary"
            onClick={() => {
              setSizeOpen(false)
              navigate('/booking')
            }}
          >
            Booking Eye Exam
          </Button>
        </div>
      </BottomSheet>

      {/* Gallery full-screen */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-overlay/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 pt-4 text-white">
            <span className="text-sm font-semibold">
              {imgIdx + 1} / {product.images.length}
            </span>
            <button
              type="button"
              aria-label="Tutup galeri"
              onClick={() => setGalleryOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
            >
              <Icon name="close" size={22} />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-4">
            <img
              src={product.images[imgIdx]}
              alt={`${product.name} tampilan ${imgIdx + 1}`}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>
          <div className="flex items-center justify-center gap-4 pb-10">
            <button
              type="button"
              aria-label="Gambar sebelumnya"
              onClick={() =>
                setImgIdx((i) => (i - 1 + product.images.length) % product.images.length)
              }
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
            >
              <Icon name="chevron_left" size={22} />
            </button>
            <div className="flex gap-1.5">
              {product.images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === imgIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/40',
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Gambar berikutnya"
              onClick={() => setImgIdx((i) => (i + 1) % product.images.length)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
            >
              <Icon name="chevron_right" size={22} />
            </button>
          </div>
        </div>
      )}

      <BottomNav />
      <ToastHost />
    </>
  )
}
