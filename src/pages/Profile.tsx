import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { BottomSheet } from '../components/ui/BottomSheet'
import { Button, IconButton } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Field'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { ToastHost } from '../components/ui/Toast'
import { getProduct } from '../data/products'
import { useCart } from '../store/CartContext'
import { useFavorites } from '../store/FavoritesContext'
import { usePrescriptions } from '../store/PrescriptionContext'
import { useProfile } from '../store/ProfileContext'
import { useToast } from '../store/ToastContext'
import { cn } from '../utils/cn'
import { formatDateFull } from '../utils/format'

interface MenuRow {
  id: string
  icon: string
  label: string
  hint?: string
  danger?: boolean
  onClick: () => void
}

export function Profile() {
  const navigate = useNavigate()
  const { profile, logout } = useProfile()
  const { list, active } = usePrescriptions()
  const { ids } = useFavorites()
  const { count } = useCart()
  const { push } = useToast()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [favOpen, setFavOpen] = useState(false)

  const latest = list[0] ?? null
  const favProducts = ids.map((id) => getProduct(id)).filter((p) => Boolean(p))

  const menu: MenuRow[] = [
    {
      id: 'edit',
      icon: 'edit',
      label: 'Edit Profil',
      hint: 'Nama, kontak, dan data diri',
      onClick: () => navigate('/profile/edit'),
    },
    {
      id: 'orders',
      icon: 'receipt_long',
      label: 'Riwayat Pesanan Kacamata',
      onClick: () => navigate('/orders'),
    },
    {
      id: 'appointments',
      icon: 'calendar_month',
      label: 'Jadwal Pemeriksaan Mata',
      onClick: () => navigate('/appointments'),
    },
    {
      id: 'prescriptions',
      icon: 'visibility',
      label: 'Resep Lensa Saya',
      hint: `${list.length} resep tersimpan`,
      onClick: () => navigate('/profile/prescriptions'),
    },
    {
      id: 'favorites',
      icon: 'favorite_border',
      label: 'Bingkai Favorit',
      hint: `${ids.length} frame`,
      onClick: () => setFavOpen(true),
    },
    {
      id: 'notifications',
      icon: 'notifications',
      label: 'Pengaturan Notifikasi',
      onClick: () => navigate('/profile/notifications'),
    },
    {
      id: 'logout',
      icon: 'logout',
      label: 'Keluar dari Akun',
      danger: true,
      onClick: () => setConfirmLogout(true),
    },
  ]

  return (
    <>
      <PageHeader
        variant="plain"
        title="Profil Saya"
        actions={
          <IconButton
            name="settings"
            label="Pengaturan"
            onClick={() => navigate('/profile/notifications')}
          />
        }
      />

      <main className="flex-1 space-y-4 px-5 pb-28 pt-4">
        {/* Kartu identitas */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center gap-3.5">
            <img
              src={profile.avatar}
              alt=""
              className="h-16 w-16 shrink-0 rounded-full border border-line object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-[19px] font-bold leading-6 text-ink">
                  {profile.name}
                </h2>
                <Icon name="verified" size={18} className="shrink-0 text-brand" />
              </div>
              <p className="mt-0.5 truncate text-xs text-ink-muted">{profile.email}</p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-[#8A5E17]">
                <Icon name="workspace_premium" size={13} />
                Member OptiCare Gold
              </span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              leadingIcon="edit"
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profil
            </Button>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              leadingIcon="notifications"
              onClick={() => navigate('/profile/notifications')}
            >
              Notifikasi
            </Button>
          </div>
        </section>

        {/* Resep terakhir */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <Icon name="visibility" size={17} className="text-brand" />
              Resep Optik Terakhir
            </h3>
            {latest && (
              <span className="text-[11px] font-medium text-ink-muted">
                {formatDateFull(latest.createdAt)}
              </span>
            )}
          </div>

          {latest ? (
            <>
              <dl className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-canvas px-3 py-2">
                  <dt className="text-xs text-ink-muted">Mata Kanan (OD)</dt>
                  <dd className="text-xs font-semibold text-ink">
                    {latest.od.sph} / Cyl {latest.od.cyl}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-canvas px-3 py-2">
                  <dt className="text-xs text-ink-muted">Mata Kiri (OS)</dt>
                  <dd className="text-xs font-semibold text-ink">
                    {latest.os.sph} / Cyl {latest.os.cyl}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/profile/prescriptions/${latest.id}`)}
                >
                  Lihat Detail
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/profile/prescriptions')}
                >
                  Semua Resep
                </Button>
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-lg bg-canvas px-3 py-4 text-center">
              <p className="text-xs text-ink-muted">Belum ada resep tersimpan.</p>
              <button
                type="button"
                onClick={() => navigate('/prescription')}
                className="mt-1 text-xs font-semibold text-brand hover:underline"
              >
                Tambah resep sekarang
              </button>
            </div>
          )}
        </section>

        {/* Menu */}
        <nav className="overflow-hidden rounded-xl border border-line bg-surface">
          {menu.map((row, i) => (
            <button
              key={row.id}
              type="button"
              onClick={row.onClick}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-canvas',
                i > 0 && 'border-t border-line',
              )}
            >
              <span
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                  row.danger ? 'bg-error/10 text-error' : 'bg-brand-light text-brand',
                )}
              >
                <Icon name={row.icon} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block truncate text-sm font-semibold',
                    row.danger ? 'text-error' : 'text-ink',
                  )}
                >
                  {row.label}
                </span>
                {row.hint && <span className="block truncate text-[11px] text-ink-muted">{row.hint}</span>}
              </span>
              <Icon name="chevron_right" size={18} className="shrink-0 text-ink-muted" />
            </button>
          ))}
        </nav>

        <p className="text-center text-[11px] leading-relaxed text-ink-muted">
          OptiCare · v1.0.0
          <br />
          Data pribadi kamu terlindungi dan hanya dipakai untuk riwayat resep & pemesanan.
        </p>
      </main>

      {/* Sheet favorit */}
      <BottomSheet open={favOpen} onClose={() => setFavOpen(false)} title="Bingkai Favorit">
        {favProducts.length === 0 ? (
          <EmptyState
            icon="favorite_border"
            title="Belum ada favorit"
            description="Ketuk ikon hati pada frame favoritmu agar mudah ditemukan lagi."
            action={
              <Button fullWidth onClick={() => { setFavOpen(false); navigate('/catalog') }}>
                Jelajahi Katalog
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2 pb-2">
            {favProducts.map(
              (p) =>
                p && (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setFavOpen(false)
                        navigate(`/product/${p.id}`)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-line bg-canvas p-3 text-left transition-colors hover:border-line-input"
                    >
                      <img
                        src={p.images[0]}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-lg border border-line bg-surface object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {p.brand} {p.name}
                        </span>
                        <span className="block truncate text-[11px] text-ink-muted">
                          {p.colors[0]?.name} · {p.gender === 'unisex' ? 'Unisex' : p.gender}
                        </span>
                        <span className="mt-0.5 block text-sm font-bold text-ink">
                          Rp{p.price.toLocaleString('id-ID')}
                        </span>
                      </span>
                      <Icon name="chevron_right" size={18} className="shrink-0 text-ink-muted" />
                    </button>
                  </li>
                ),
            )}
          </ul>
        )}
      </BottomSheet>

      {/* Konfirmasi logout */}
      <Modal
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="Keluar dari Akun?"
        icon="logout"
        footer={
          <>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmLogout(false)
                logout()
                push('Kamu telah keluar dari akun', 'info')
                navigate('/')
              }}
            >
              Ya, Keluar
            </Button>
            <Button variant="outline" onClick={() => setConfirmLogout(false)}>
              Batal
            </Button>
          </>
        }
      >
        Kamu perlu masuk kembali untuk melihat pesanan dan resep.
        {count > 0 && (
          <span className="mt-2 flex items-start gap-1.5 rounded-lg bg-warning/10 p-2.5 text-[11px] text-[#8A5E17]">
            <Icon name="shopping_cart" size={14} className="mt-0.5 shrink-0" />
            {count} item di keranjang akan tersimpan di perangkat ini.
          </span>
        )}
      </Modal>

      {/* Status resep aktif (badge kecil di bawah kartu identitas) */}
      {active && (
        <span className="sr-only">Resep aktif: {active.label}</span>
      )}

      <BottomNav />
      <ToastHost />
    </>
  )
}
