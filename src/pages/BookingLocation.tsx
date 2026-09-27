import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { BookingSteps } from '../components/booking/BookingSteps'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { EXAM_TYPES } from '../data/appointments'
import { branches } from '../data/branches'
import { useBooking } from '../store/BookingContext'
import { useToast } from '../store/ToastContext'
import { cn } from '../utils/cn'
import { formatDateTimeID } from '../utils/format'

export function BookingLocation() {
  const navigate = useNavigate()
  const { draft, patch } = useBooking()
  const { push } = useToast()
  const exam = EXAM_TYPES.find((e) => e.id === draft.service) ?? EXAM_TYPES[0]
  const nearby = branches.filter((b) => b.distanceKm <= 6)

  const ready = Boolean(draft.date && draft.time)
  useEffect(() => {
    if (!ready) navigate('/booking', { replace: true })
  }, [ready, navigate])
  if (!ready) return null

  return (
    <>
      <PageHeader
        title="Pilih Lokasi & Jadwal"
        actions={
          <IconButton
            name="help_outline"
            label="Bantuan"
            onClick={() => push('Pilih cabang terdekat dengan lokasimu', 'info')}
          />
        }
      />
      <BookingSteps current={2} />

      <main className="flex-1 space-y-4 px-5 pb-40 pt-5">
        {/* Ringkasan jadwal */}
        <div className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand-light p-3">
          <Icon name="calendar_today" size={20} className="shrink-0 text-brand" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink">
              {formatDateTimeID(draft.date, draft.time)}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              {exam.name} ({exam.price === 0 ? 'Gratis' : `Rp${exam.price.toLocaleString('id-ID')}`})
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/booking')}
            className="shrink-0 text-xs font-semibold text-brand hover:underline"
          >
            Ubah
          </button>
        </div>

        {/* Pilih lokasi */}
        <div>
          <h2 className="text-[19px] font-bold text-ink">Pilih Lokasi Optik</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Pilih cabang yang paling mudah kamu kunjungi.
          </p>
          <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-[11px] font-semibold text-ink-muted">
            <Icon name="near_me" size={14} className="text-brand" />
            {nearby.length} cabang dalam jangkauan 6 km
          </span>
        </div>

        <div className="space-y-2.5">
          {branches.map((branch) => {
            const selected = draft.branchId === branch.id
            const tight = branch.distanceKm <= 4
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => patch({ branchId: branch.id })}
                aria-pressed={selected}
                className={cn(
                  'w-full rounded-xl border p-3.5 text-left transition-colors',
                  selected
                    ? 'border-brand bg-brand-light'
                    : 'border-line bg-surface hover:border-line-input',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-ink">{branch.name}</span>
                      {selected && (
                        <span className="shrink-0 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          Terpilih
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">{branch.address}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-ink-muted">
                    {branch.distanceKm} km
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                  <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                    <Icon name="schedule" size={14} className="text-brand" />
                    {branch.hours}
                  </span>
                  <span
                    className={cn(
                      'text-[11px] font-semibold',
                      tight ? 'text-success' : 'text-warning',
                    )}
                  >
                    {tight ? 'Tersedia' : 'Slot Terbatas'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <p className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3.5 text-[11px] leading-snug text-ink-muted">
          <Icon name="verified_user" size={16} className="mt-0.5 shrink-0 text-brand" />
          Seluruh cabang dilengkapi fasilitas pemeriksaan refraksi standar dan optometris
          berlisensi.
        </p>
      </main>

      <StickyBar>
        <p className="mb-2 flex items-center gap-1.5 text-[11px] text-ink-muted">
          <Icon name="location_on" size={14} className="text-brand" />
          Cabang Terpilih:{' '}
          <span className="font-semibold text-ink">
            {branches.find((b) => b.id === draft.branchId)?.name} (
            {branches.find((b) => b.id === draft.branchId)?.distanceKm} km)
          </span>
        </p>
        <Button
          fullWidth
          size="lg"
          className="h-12 rounded-xl"
          trailingIcon="arrow_forward"
          onClick={() => navigate('/booking/confirmation')}
        >
          Lanjutkan ke Konfirmasi
        </Button>
        <button
          type="button"
          onClick={() => navigate('/booking')}
          className="mt-2 w-full text-center text-xs font-semibold text-brand hover:underline"
        >
          Kembali ke Pilih Jadwal
        </button>
      </StickyBar>

      <BottomNav />
      <ToastHost />
    </>
  )
}
