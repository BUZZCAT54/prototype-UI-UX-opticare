import { useNavigate } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { BookingSteps } from '../components/booking/BookingSteps'
import { MonthCalendar } from '../components/booking/MonthCalendar'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { EXAM_TYPES, TIME_SLOTS } from '../data/appointments'
import { getBranch } from '../data/branches'
import { useBooking } from '../store/BookingContext'
import { useProfile } from '../store/ProfileContext'
import { useToast } from '../store/ToastContext'
import { cn } from '../utils/cn'
import { formatDateTimeID, formatRupiah } from '../utils/format'

export function Booking() {
  const navigate = useNavigate()
  const { draft, patch } = useBooking()
  const { profile } = useProfile()
  const { push } = useToast()
  const branch = getBranch(draft.branchId)
  const ready = Boolean(draft.date && draft.time)

  return (
    <>
      <PageHeader
        title="Book Eye Exam"
        actions={
          <IconButton
            name="help_outline"
            label="Bantuan"
            onClick={() => push('Reservasi online buka 09:00 – 21:00 WIB', 'info')}
          />
        }
      />
      <BookingSteps current={1} />

      <main className="flex-1 space-y-4 px-5 pb-40 pt-5">
        {/* Intro */}
        <div>
          <h2 className="text-[19px] font-bold text-ink">Pilih Jadwal Pemeriksaan</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Pilih tanggal dan waktu yang paling nyaman untukmu.
          </p>
        </div>

        {/* Jenis pemeriksaan */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-ink">Jenis Pemeriksaan</h3>
            <button
              type="button"
              onClick={() =>
                push(
                  'Dasar: visus ±20 menit. Lengkap: +tekanan mata & kejernihan lensa ±30 menit.',
                  'info',
                )
              }
              className="text-xs font-semibold text-brand hover:underline"
            >
              Pelajari Perbedaan
            </button>
          </div>
          {EXAM_TYPES.map((type) => {
            const selected = draft.service === type.id
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => patch({ service: type.id })}
                aria-pressed={selected}
                className={cn(
                  'w-full rounded-xl border p-3.5 text-left transition-colors',
                  selected
                    ? 'border-brand bg-brand-light'
                    : 'border-line bg-surface hover:border-line-input',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-ink">{type.name}</span>
                  <span
                    className={cn(
                      'shrink-0 text-xs font-bold',
                      type.price === 0 ? 'text-success' : 'text-ink',
                    )}
                  >
                    {type.price === 0 ? 'Gratis / Free' : formatRupiah(type.price)}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-snug text-ink-muted">{type.description}</p>
                <span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
                  <Icon name="schedule" size={14} className="text-brand" />±{type.duration} menit
                </span>
              </button>
            )
          })}
        </section>

        {/* Kalender + waktu */}
        <MonthCalendar value={draft.date} onChange={(iso) => patch({ date: iso })} />

        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xs font-bold text-ink">Pilih Waktu</h3>
            <span className="text-[11px] font-medium text-ink-muted">
              Waktu Indonesia Barat (WIB)
            </span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const selected = draft.time === slot
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => patch({ time: slot })}
                  className={cn(
                    'h-10 rounded-lg border text-xs font-semibold transition-colors',
                    selected
                      ? 'border-brand bg-brand text-white'
                      : 'border-line-input bg-canvas text-ink hover:border-brand',
                  )}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </section>

        {/* Untuk siapa */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <h3 className="mb-3 text-xs font-bold text-ink">Pemeriksaan Untuk</h3>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() =>
                patch({ forSelf: true, patientName: profile.name, phone: '+62 812-3456-7890' })
              }
              className={cn(
                'rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors',
                draft.forSelf
                  ? 'border-brand bg-brand-light text-ink'
                  : 'border-line bg-canvas text-ink-muted',
              )}
            >
              Saya Sendiri ({profile.name.split(' ')[0]})
            </button>
            <button
              type="button"
              onClick={() => patch({ forSelf: false, patientName: '' })}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors',
                !draft.forSelf
                  ? 'border-brand bg-brand-light text-ink'
                  : 'border-line bg-canvas text-ink-muted',
              )}
            >
              Orang Lain
            </button>
          </div>
          {!draft.forSelf && (
            <div className="mt-3 space-y-2">
              <input
                value={draft.patientName}
                onChange={(e) => patch({ patientName: e.target.value })}
                placeholder="Nama pasien (wajib)"
                aria-label="Nama pasien"
                className="h-11 w-full rounded-xl border border-line-input bg-surface px-3.5 text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <input
                value={draft.phone}
                onChange={(e) => patch({ phone: e.target.value })}
                placeholder="Nomor kontak"
                aria-label="Nomor kontak"
                className="h-11 w-full rounded-xl border border-line-input bg-surface px-3.5 text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
          )}
        </section>

        {/* Lokasi */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between pb-2.5">
            <h3 className="text-xs font-bold text-ink">Lokasi Cabang</h3>
            <button
              type="button"
              onClick={() => navigate('/booking/location')}
              className="flex items-center gap-0.5 text-xs font-semibold text-brand hover:underline"
            >
              Ubah Cabang
              <Icon name="chevron_right" size={14} />
            </button>
          </div>
          <div className="flex gap-3 rounded-xl border border-line bg-canvas p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-light text-brand">
              <Icon name="store" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-ink">{branch?.name}</span>
                <span className="shrink-0 rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                  Buka
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-ink-muted">
                {branch?.address} · {branch?.distanceKm} km
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 border-t border-line pt-1.5 text-[11px] text-ink-muted">
                <Icon name="schedule" size={14} className="text-brand" />
                Jam Layanan: {branch?.hours}
              </p>
            </div>
          </div>
          <p className="mt-2.5 flex gap-1.5 rounded-lg bg-brand-light p-2.5 text-[11px] leading-snug text-ink-muted">
            <Icon name="info" size={14} className="mt-0.5 shrink-0 text-brand" />
            Datang 10 menit sebelum jadwal pemeriksaan.
          </p>
        </section>

        {/* Catatan */}
        <section className="rounded-xl border border-line bg-surface p-4">
          <h3 className="mb-2 text-xs font-bold text-ink">Catatan / Keluhan (opsional)</h3>
          <textarea
            value={draft.note}
            onChange={(e) => patch({ note: e.target.value })}
            rows={3}
            placeholder='Mis. "Pemeriksaan rutin & update ukuran kacamata"'
            className="w-full resize-none rounded-xl border border-line-input bg-canvas p-3 text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </section>

        {/* Info biaya */}
        <p className="flex items-start gap-2 px-1 text-[11px] leading-snug text-ink-muted">
          <Icon name="info" size={14} className="mt-0.5 shrink-0 text-success" />
          <span>
            <span className="font-semibold text-ink">Bebas biaya (Rp 0)</span> untuk
            Pemeriksaan Mata Dasar di seluruh cabang resmi OptiCare.
          </span>
        </p>
      </main>

      <StickyBar>
        <div className="mb-2.5 space-y-0.5">
          <p className="text-[11px] text-ink-muted">
            Waktu Terpilih:{' '}
            <span className="font-semibold text-ink">
              {ready ? formatDateTimeID(draft.date, draft.time) : 'Belum dipilih'}
            </span>
          </p>
          <p className="text-[11px] text-ink-muted">
            Lokasi:{' '}
            <span className="font-semibold text-ink">
              {branch?.name.replace('OptiCare ', 'Cabang ')}
            </span>
          </p>
        </div>
        <Button
          fullWidth
          size="lg"
          className="h-12 rounded-xl"
          trailingIcon="arrow_forward"
          disabled={!ready || (!draft.forSelf && draft.patientName.trim() === '')}
          onClick={() => navigate('/booking/confirmation')}
        >
          Lanjutkan ke Konfirmasi
        </Button>
        <p className="mt-2 text-center text-[11px] text-ink-muted">
          Pembatalan &amp; ubah jadwal gratis hingga 2 jam sebelumnya.
        </p>
      </StickyBar>

      <BottomNav />
      <ToastHost />
    </>
  )
}
