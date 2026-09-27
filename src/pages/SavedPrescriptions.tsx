import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { Badge } from '../components/ui/Chip'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { useCart } from '../store/CartContext'
import { usePrescriptions } from '../store/PrescriptionContext'
import { useToast } from '../store/ToastContext'
import { cn } from '../utils/cn'
import { formatDateFull } from '../utils/format'
import type { Prescription } from '../types'

const SOURCE_LABEL: Record<Prescription['source'], string> = {
  manual: 'OptiCare Eye Check',
  upload: 'Pemeriksaan Mandiri / Klinik Mitra',
}

function RxTable({ rx }: { rx: Prescription }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-line">
      <div className="grid grid-cols-4 bg-canvas px-3 py-2 text-[11px] font-semibold text-ink-muted">
        <span>Mata</span>
        <span className="text-right">SPH</span>
        <span className="text-right">CYL</span>
        <span className="text-right">AXIS</span>
      </div>
      {(
        [
          ['OD', 'Kanan', rx.od],
          ['OS', 'Kiri', rx.os],
        ] as const
      ).map(([code, side, val]) => (
        <div
          key={code}
          className="grid grid-cols-4 items-center border-t border-line bg-surface px-3 py-2.5"
        >
          <span className="text-xs font-bold text-ink">
            {code} <span className="font-normal text-ink-muted">({side})</span>
          </span>
          <span className="text-right text-sm font-semibold text-ink">{val.sph}</span>
          <span className="text-right text-sm font-semibold text-ink">{val.cyl}</span>
          <span className="text-right text-sm font-semibold text-ink">{val.axis}°</span>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-line bg-canvas px-3 py-2.5">
        <span className="text-xs text-ink-muted">PD (Pupillary Distance)</span>
        <span className="text-sm font-semibold text-ink">{rx.od.pd} mm</span>
      </div>
    </div>
  )
}

export function SavedPrescriptions() {
  const navigate = useNavigate()
  const { list, activeId, setActive } = usePrescriptions()
  const { count } = useCart()
  const { push } = useToast()

  const useForOrder = (rx: Prescription) => {
    setActive(rx.id)
    push('Resep diaktifkan untuk pesananmu', 'success')
    navigate(count > 0 ? '/cart' : '/catalog')
  }

  return (
    <>
      <PageHeader
        variant="plain"
        actions={
          <IconButton
            name="help_outline"
            label="Bantuan"
            onClick={() => push('Resep optik disimpan aman dan bisa dipakai ulang', 'info')}
          />
        }
      >
        <div className="flex items-center gap-2">
          <h1 className="truncate text-[22px] font-bold leading-7 tracking-tight text-ink">
            Resep Lensa
          </h1>
          <Badge tone="brand">{list.length} Resep</Badge>
        </div>
      </PageHeader>

      <main className="flex-1 space-y-4 px-5 pb-28 pt-4">
        <p className="flex items-start gap-2 rounded-xl border border-brand/30 bg-brand-light p-3.5 text-[11px] leading-relaxed text-brand-dark">
          <Icon name="verified_user" size={17} className="mt-0.5 shrink-0 text-brand" />
          Resep optik Anda tersimpan aman dan terintegrasi otomatis untuk pemesanan kacamata dan
          lensa di OptiCare.
        </p>

        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-input bg-surface px-5 py-10 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-light text-brand">
              <Icon name="visibility" size={24} />
            </span>
            <h3 className="text-[17px] font-bold text-ink">Belum ada resep</h3>
            <p className="mx-auto mt-1 max-w-[34ch] text-sm text-ink-muted">
              Upload atau masukkan resep agar pesanan lensamu lebih cepat diproses.
            </p>
            <Button className="mt-4" leadingIcon="add_circle" onClick={() => navigate('/prescription')}>
              Tambah / Upload Resep Baru
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((rx, index) => {
              const isActive = rx.id === activeId || (activeId === null && index === 0)
              const riwayat = rx.source === 'upload'
              return (
                <article key={rx.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                        <Icon
                          name={riwayat ? 'history' : 'calendar_today'}
                          size={16}
                          className="text-brand"
                        />
                        {formatDateFull(rx.createdAt)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        {riwayat ? 'Pemeriksaan Mandiri / Klinik Mitra' : 'OptiCare Eye Check'}
                      </p>
                    </div>
                    <span className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                      <Badge tone={isActive ? 'brand' : 'neutral'}>
                        {isActive ? 'Aktif' : 'Riwayat'}
                      </Badge>
                      <Badge tone="success">
                        <Icon name="check_circle" size={12} />
                        Terverifikasi
                      </Badge>
                    </span>
                  </div>

                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-canvas px-3 py-2.5">
                    <Icon name="medical_services" size={16} className="mt-0.5 shrink-0 text-brand" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-ink-muted">Pemeriksa</p>
                      <p className="truncate text-xs font-semibold text-ink">
                        {rx.doctor ?? SOURCE_LABEL[rx.source]}
                      </p>
                    </div>
                  </div>

                  <RxTable rx={rx} />

                  <div className="mt-3 flex flex-col gap-2">
                    <Button
                      size="sm"
                      fullWidth
                      variant={isActive ? 'outline' : 'primary'}
                      leadingIcon="shopping_bag"
                      onClick={() => useForOrder(rx)}
                    >
                      {isActive ? 'Digunakan untuk Pesanan' : 'Gunakan untuk Pesanan'}
                    </Button>
                    <Button
                      size="sm"
                      fullWidth
                      variant="ghost"
                      trailingIcon="chevron_right"
                      onClick={() => navigate(`/profile/prescriptions/${rx.id}`)}
                    >
                      Lihat Detail &amp; Unduh PDF
                    </Button>
                  </div>

                  {riwayat && (
                    <button
                      type="button"
                      onClick={() => navigate('/booking')}
                      className={cn(
                        'mt-3 flex w-full items-center justify-center gap-1.5 border-t border-line pt-3',
                        'text-xs font-semibold text-brand hover:underline',
                      )}
                    >
                      <Icon name="update" size={15} />
                      Perbarui Resep dengan Booking Baru
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {list.length > 0 && (
          <Button
            fullWidth
            variant="secondary"
            leadingIcon="add_circle"
            onClick={() => navigate('/prescription')}
          >
            Tambah / Upload Resep Baru
          </Button>
        )}

        <p className="text-center text-[11px] leading-relaxed text-ink-muted">
          Nilai resep berlaku sebagai acuan pengerjaan lensa. Konsultasikan kembali bila visi
          berubah.
        </p>
      </main>

      <BottomNav />
      <ToastHost />
    </>
  )
}
