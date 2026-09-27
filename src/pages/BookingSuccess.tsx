import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { EXAM_TYPES } from '../data/appointments'
import { getBranch } from '../data/branches'
import { useAppointments } from '../store/AppointmentContext'
import { useBooking } from '../store/BookingContext'
import { useToast } from '../store/ToastContext'
import { formatDateFull, formatRupiah, formatWeekdayLong } from '../utils/format'

export function BookingSuccess() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { appointments, get } = useAppointments()
  const { push } = useToast()
  const { reset } = useBooking()
  const didReset = useRef(false)

  const appt = get(params.get('appt') ?? undefined) ?? appointments[0]

  useEffect(() => {
    if (!appt) navigate('/booking', { replace: true })
    if (appt && !didReset.current) {
      didReset.current = true
      reset()
    }
  }, [appt, navigate, reset])
  if (!appt) return null

  const exam = EXAM_TYPES.find((e) => e.id === appt.service) ?? EXAM_TYPES[0]
  const branch = getBranch(appt.branchId)

  return (
    <>
      <PageHeader
        variant="plain"
        title="Status Booking"
        actions={
          <>
            <IconButton name="close" label="Tutup" onClick={() => navigate('/')} />
            <IconButton
              name="help_outline"
              label="Bantuan"
              onClick={() => push('Hubungi OptiCare di 0800-1234', 'info')}
            />
          </>
        }
      />

      <main className="flex-1 px-5 pb-32 pt-6">
        <div className="mx-auto max-w-[460px] space-y-4">
          <div className="flex flex-col items-center rounded-xl border border-line bg-surface p-5 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-light text-brand">
              <Icon name="check_circle" size={36} />
            </span>
            <h2 className="mt-3 text-[22px] font-bold text-ink">Booking Berhasil!</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              Jadwal pemeriksaan mata Anda telah terkonfirmasi dan tersimpan di sistem OptiCare.
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-ink-muted">ID Booking:</span>
              <span className="font-mono font-bold text-ink">{appt.code}</span>
              <button
                type="button"
                aria-label="Salin ID Booking"
                onClick={() => {
                  void navigator.clipboard?.writeText(appt.code)
                  push('ID booking disalin')
                }}
                className="text-ink-muted transition-colors hover:text-brand"
              >
                <Icon name="content_copy" size={14} />
              </button>
            </p>
          </div>

          <section className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between pb-2.5">
              <h3 className="text-xs font-bold text-ink">Detail Pemeriksaan</h3>
              <span className="flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                <Icon name="check_circle" size={13} />
                Terkonfirmasi
              </span>
            </div>
            <div className="space-y-3">
              <DetailRow
                icon="visibility"
                label="Layanan"
                value={exam.name}
                right={
                  <span className={exam.price === 0 ? 'text-success' : 'text-ink'}>
                    {exam.price === 0 ? 'Gratis' : formatRupiah(exam.price)}
                  </span>
                }
              />
              <DetailRow
                icon="calendar_today"
                label="Tanggal & Waktu"
                value={`${formatWeekdayLong(appt.date)}, ${formatDateFull(appt.date)} · ${appt.time} WIB`}
              />
              <DetailRow
                icon="store"
                label="Lokasi Cabang"
                value={`${branch?.name}\n${branch?.address}`}
                right={
                  <span className="text-ink-muted">{branch?.distanceKm} km</span>
                }
              />
              <DetailRow
                icon="person"
                label="Nama Pasien"
                value={`${appt.patientName ?? 'Ariq Athallah'} (${
                  appt.relation === 'Orang Lain' ? 'Dewasa' : 'Dewasa'
                })`}
              />
            </div>
          </section>

          <p className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3.5 text-[11px] leading-snug text-ink-muted">
            <Icon name="info" size={14} className="mt-0.5 shrink-0 text-brand" />
            Harap tiba <span className="font-semibold text-ink">10 menit lebih awal</span> untuk
            registrasi awal di front desk optik.
          </p>
        </div>
      </main>

      <StickyBar>
        <div className="flex gap-2.5">
          <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={() => navigate('/')}>
            Kembali ke Home
          </Button>
          <Button
            className="h-12 flex-1 rounded-xl"
            trailingIcon="arrow_forward"
            onClick={() => navigate(`/appointments/${appt.id}`)}
          >
            Lihat Jadwal
          </Button>
        </div>
      </StickyBar>

      <BottomNav />
      <ToastHost />
    </>
  )
}

function DetailRow({
  icon,
  label,
  value,
  right,
}: {
  icon: string
  label: string
  value: string
  right?: ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-light text-brand">
        <Icon name={icon} size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-ink-muted">{label}</p>
        <p className="whitespace-pre-line text-xs font-semibold leading-snug text-ink">{value}</p>
      </div>
      {right && <span className="shrink-0 text-xs font-semibold">{right}</span>}
    </div>
  )
}
