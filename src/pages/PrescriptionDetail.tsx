import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { Button, IconButton } from '../components/ui/Button'
import { Badge } from '../components/ui/Chip'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { useCart } from '../store/CartContext'
import { usePrescriptions } from '../store/PrescriptionContext'
import { useToast } from '../store/ToastContext'
import { formatDateFull } from '../utils/format'
import type { Prescription, RxValues } from '../types'

const SOURCE_LABEL: Record<Prescription['source'], string> = {
  manual: 'OptiCare Eye Check',
  upload: 'Dokter Mata / Klinik Mitra',
}

const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })

function validityLabel(createdAt: string): string {
  const d = new Date(`${createdAt}T00:00:00`)
  d.setFullYear(d.getFullYear() + 1)
  return monthYear.format(d)
}

function EyeCard({
  code,
  side,
  values,
}: {
  code: string
  side: string
  values: RxValues
}) {
  const cells = [
    ['SPH', values.sph],
    ['CYL', values.cyl],
    ['AXIS', `${values.axis}°`],
  ]
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold text-ink">
          {code} <span className="font-normal text-ink-muted">({side})</span>
        </span>
        <span className="text-[11px] text-ink-muted">Dioptri (D)</span>
      </div>
      <dl className="mt-2.5 space-y-1.5">
        {cells.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2"
          >
            <dt className="text-[11px] font-semibold tracking-wide text-ink-muted">{label}</dt>
            <dd className="text-sm font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-light text-brand">
        <Icon name={icon} size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-ink-muted">{label}</p>
        <p className="truncate text-xs font-semibold text-ink">{value}</p>
      </div>
    </div>
  )
}

export function PrescriptionDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { list, activeId, setActive } = usePrescriptions()
  const { count } = useCart()
  const { push } = useToast()

  const rx = list.find((r) => r.id === id)
  const missing = !rx

  useEffect(() => {
    if (missing) navigate('/profile/prescriptions', { replace: true })
  }, [missing, navigate])
  if (!rx) return null

  const isActive = rx.id === activeId || (activeId === null && list[0]?.id === rx.id)
  const source = SOURCE_LABEL[rx.source]

  const useForOrder = () => {
    setActive(rx.id)
    push('Resep diaktifkan untuk pesananmu', 'success')
    navigate(count > 0 ? '/cart' : '/catalog')
  }

  return (
    <>
      <PageHeader
        title="Detail Resep"
        actions={
          <IconButton
            name="help_outline"
            label="Bantuan"
            onClick={() => push('Resep diverifikasi sistem OptiCare setelah pemeriksaan', 'info')}
          />
        }
      />

      <main className="flex-1 space-y-4 px-5 pb-40 pt-4">
        {/* Status */}
        <section className="space-y-3 rounded-xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isActive ? 'brand' : 'neutral'}>
              <Icon name={isActive ? 'visibility' : 'history'} size={12} />
              {isActive ? 'Resep Aktif' : 'Resep Arsip'}
            </Badge>
            <Badge tone="success">
              <Icon name="verified" size={12} />
              Terverifikasi
            </Badge>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-canvas px-3 py-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-light text-brand">
              <Icon name="visibility" size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink">Resep Optik Utama</p>
              <p className="truncate text-[11px] text-ink-muted">
                {source} • Tervalidasi Sistem
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-xs text-ink-muted">Masa Berlaku Rekomendasi</span>
            <span className="text-xs font-semibold text-ink">
              Hingga {validityLabel(rx.createdAt)}
            </span>
          </div>
        </section>

        {/* Parameter refraksi */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <Icon name="tune" size={17} className="text-brand" />
              Parameter Refraksi
            </h2>
            <span className="text-[11px] text-ink-muted">Satuan Dioptri (D)</span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <EyeCard code="OD" side="Mata Kanan" values={rx.od} />
            <EyeCard code="OS" side="Mata Kiri" values={rx.os} />
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-brand/30 bg-brand-light px-3.5 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-brand">
              <Icon name="straighten" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink">Pupillary Distance (PD)</p>
              <p className="text-[11px] text-ink-muted">Jarak fokus pusat pupil optik</p>
            </div>
            <span className="text-lg font-bold text-ink">{rx.od.pd} mm</span>
          </div>
        </section>

        {/* Informasi pemeriksaan */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="text-sm font-bold text-ink">Informasi Pemeriksaan</h2>
          <div className="mt-1 divide-y divide-line">
            <InfoRow
              icon="calendar_today"
              label="Tanggal Periksa"
              value={formatDateFull(rx.createdAt)}
            />
            <InfoRow icon="note_alt" label="Sumber Resep" value={source} />
            <InfoRow
              icon="person"
              label="Pemeriksa"
              value={rx.doctor?.replace(/\s*\(.*\)$/, '') ?? 'Dr. Andika Pratama, Sp.M'}
            />
            <InfoRow icon="store" label="Cabang Optik" value="OptiCare Padang" />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-[11px] text-ink-muted">Label tersimpan</span>
            <span className="truncate text-[11px] font-semibold text-ink">{rx.label}</span>
          </div>
        </section>

        <p className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3.5 text-[11px] leading-relaxed text-ink-muted">
          <Icon name="verified_user" size={16} className="mt-0.5 shrink-0 text-brand" />
          Resep ini tersimpan aman di profil OptiCare Anda dan dapat langsung disematkan otomatis
          saat memesan frame kacamata atau lensa pengganti.
        </p>

        <Button
          variant="ghost"
          fullWidth
          leadingIcon="download"
          onClick={() => push('PDF resep disiapkan (demo)', 'success')}
        >
          Unduh PDF Resep
        </Button>
      </main>

      <StickyBar className="space-y-2">
        <Button fullWidth size="lg" className="h-12 rounded-xl" leadingIcon="shopping_bag" onClick={useForOrder}>
          Gunakan untuk Pesanan
        </Button>
        <Button
          fullWidth
          variant="outline"
          leadingIcon="calendar_month"
          onClick={() => navigate('/booking')}
        >
          Booking Pemeriksaan Baru
        </Button>
      </StickyBar>

      <ToastHost />
    </>
  )
}
