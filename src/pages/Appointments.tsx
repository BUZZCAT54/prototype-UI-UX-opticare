import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/Layout'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { EmptyState, Tabs } from '../components/ui/Field'
import { ToastHost } from '../components/ui/Toast'
import { APPOINTMENT_TABS, EXAM_TYPES } from '../data/appointments'
import { getBranch } from '../data/branches'
import { useAppointments } from '../store/AppointmentContext'
import type { Appointment } from '../types'
import { cn } from '../utils/cn'
import { formatDateFull, formatWeekdayLong } from '../utils/format'

type Filter = (typeof APPOINTMENT_TABS)[number]['id']

export function Appointments() {
  const navigate = useNavigate()
  const { appointments } = useAppointments()
  const [filter, setFilter] = useState<Filter>('all')

  const counts: Record<Filter, number> = {
    all: appointments.length,
    upcoming: appointments.filter((a) => a.status === 'upcoming').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  }

  const list = appointments.filter((a) => filter === 'all' || a.status === filter)
  const upcoming = list.filter((a) => a.status === 'upcoming')
  const completed = list.filter((a) => a.status === 'completed')
  const cancelled = list.filter((a) => a.status === 'cancelled')

  return (
    <>
      <PageHeader
        variant="plain"
        title="Riwayat Pemeriksaan"
        subtitle="Pantau jadwal janji temu dan riwayat pemeriksaan matamu"
        actions={
          <button
            type="button"
            onClick={() => navigate('/booking')}
            className="mr-1 flex h-9 items-center gap-1 rounded-lg bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <Icon name="add_circle" size={16} />
            Booking Baru
          </button>
        }
      />

      <main className="flex-1 space-y-4 px-5 pb-24 pt-4">
        {/* Promo */}
        <div className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand-light p-3.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-brand">
            <Icon name="add_circle" size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink">Pemeriksaan Rutin?</p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
              Cek ketajaman matamu secara berkala
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/booking')}>
            Booking
          </Button>
        </div>

        <Tabs
          items={APPOINTMENT_TABS.map((tab) => ({
            id: tab.id,
            label: tab.label,
            count: counts[tab.id],
          }))}
          value={filter}
          onChange={setFilter}
        />

        {appointments.length === 0 ? (
          <EmptyState
            icon="calendar_today"
            title="Belum ada janji temu"
            description="Jadwal konsultasi dan pemeriksaan ketajaman matamu akan muncul di sini. Lakukan pemeriksaan rutin untuk menjaga kenyamanan penglihatan."
            action={
              <Button className="mt-4 rounded-xl" leadingIcon="add" onClick={() => navigate('/booking')}>
                Booking Pemeriksaan
              </Button>
            }
          />
        ) : list.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="Tidak ada janji temu"
            description="Belum ada janji temu pada kategori ini."
            action={
              <Button className="mt-4 rounded-xl" variant="outline" onClick={() => setFilter('all')}>
                Lihat Semua
              </Button>
            }
          />
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-ink">Jadwal Mendatang</h3>
                {upcoming.map((appt) => (
                  <UpcomingCard key={appt.id} appt={appt} />
                ))}
              </section>
            )}
            {completed.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-ink">Riwayat Selesai</h3>
                {completed.map((appt) => (
                  <CompletedCard key={appt.id} appt={appt} />
                ))}
              </section>
            )}
            {cancelled.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-ink">Dibatalkan</h3>
                {cancelled.map((appt) => (
                  <CancelledCard key={appt.id} appt={appt} />
                ))}
              </section>
            )}
          </>
        )}

        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-3.5">
          <Icon name="verified_user" size={18} className="shrink-0 text-brand" />
          <div>
            <p className="text-xs font-bold text-ink">Pemeriksaan Rutin Disarankan</p>
            <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
              Cek berkala setiap 6–12 bulan untuk mendeteksi perubahan refraksi mata.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
      <ToastHost />
    </>
  )
}

const STATUS: Record<Appointment['status'], { label: string; className: string; icon: string }> = {
  upcoming: { label: 'Akan Datang', className: 'bg-brand-light text-brand', icon: 'schedule' },
  completed: { label: 'Selesai', className: 'bg-success/10 text-success', icon: 'event_available' },
  cancelled: { label: 'Dibatalkan', className: 'bg-error/10 text-error', icon: 'event_busy' },
}

function StatusPill({ status }: { status: Appointment['status'] }) {
  const s = STATUS[status]
  return (
    <span className={cn('flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold', s.className)}>
      <Icon name={s.icon} size={13} />
      {s.label}
    </span>
  )
}

function serviceOf(appt: Appointment) {
  return EXAM_TYPES.find((e) => e.id === appt.service) ?? EXAM_TYPES[0]
}

function UpcomingCard({ appt }: { appt: Appointment }) {
  const navigate = useNavigate()
  const branch = getBranch(appt.branchId)
  const exam = serviceOf(appt)
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2 pb-2.5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Layanan Klinis
          </span>
          <h4 className="text-sm font-bold text-ink">{exam.name}</h4>
        </div>
        <StatusPill status={appt.status} />
      </div>
      <div className="space-y-2 border-t border-line pt-2.5 text-xs">
        <p className="flex items-center gap-2 text-ink">
          <Icon name="schedule" size={15} className="shrink-0 text-brand" />
          {formatWeekdayLong(appt.date)}, {formatDateFull(appt.date)} · {appt.time} WIB
        </p>
        <p className="flex items-start gap-2 text-ink-muted">
          <Icon name="location_on" size={15} className="mt-0.5 shrink-0 text-brand" />
          <span>
            <span className="block font-semibold text-ink">{branch?.name}</span>
            {branch?.address}
          </span>
        </p>
        <p className="flex items-center gap-2 text-ink-muted">
          <Icon name="person" size={15} className="shrink-0 text-brand" />
          Pasien: <span className="font-semibold text-ink">{appt.patientName ?? 'Ariq Athallah'}</span>{' '}
          ({appt.relation ?? 'Saya Sendiri'})
        </p>
        <p className="flex gap-2 rounded-lg bg-canvas p-2.5 text-[11px] leading-snug text-ink-muted">
          <Icon name="info" size={14} className="mt-0.5 shrink-0 text-brand" />
          Datang 10 menit sebelum jadwal pemeriksaan. Bawa kacamata lama jika tersedia.
        </p>
      </div>
      <div className="mt-3 flex gap-2 border-t border-line pt-3">
        <Button size="sm" className="flex-1 rounded-lg" onClick={() => navigate(`/appointments/${appt.id}`)}>
          Lihat Detail
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-lg"
          onClick={() => navigate(`/appointments/${appt.id}?action=reschedule`)}
        >
          Ubah Jadwal
        </Button>
      </div>
    </article>
  )
}

function CompletedCard({ appt }: { appt: Appointment }) {
  const navigate = useNavigate()
  const branch = getBranch(appt.branchId)
  const exam = serviceOf(appt)
  return (
    <article
      className="cursor-pointer rounded-xl border border-line bg-surface p-4"
      onClick={() => navigate(`/appointments/${appt.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/appointments/${appt.id}`)}
    >
      <div className="flex items-start justify-between gap-2 pb-2.5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Layanan Klinis
          </span>
          <h4 className="text-sm font-bold text-ink">{exam.name}</h4>
        </div>
        <StatusPill status={appt.status} />
      </div>
      <div className="space-y-2 border-t border-line pt-2.5 text-xs">
        <p className="flex items-center gap-2 text-ink-muted">
          <Icon name="event_available" size={15} className="shrink-0 text-success" />
          {formatDateFull(appt.date)} · {appt.time} WIB
        </p>
        <p className="flex items-center gap-2 text-ink-muted">
          <Icon name="storefront" size={15} className="shrink-0 text-brand" />
          Lokasi: <span className="font-semibold text-ink">{branch?.name}</span>
        </p>
        <p className="flex items-center gap-2 text-ink-muted">
          <Icon name="document_scanner" size={15} className="shrink-0 text-brand" />
          Resep Tersedia <span className="font-semibold text-ink">OD -1.50 / OS -1.25</span>
        </p>
      </div>
      <div className="mt-3 flex gap-2 border-t border-line pt-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-lg"
          onClick={(e) => {
            e.stopPropagation()
            navigate('/profile/prescriptions')
          }}
        >
          Lihat Hasil
        </Button>
        <Button
          size="sm"
          variant="quiet"
          className="flex-1 rounded-lg"
          onClick={(e) => {
            e.stopPropagation()
            navigate('/profile/prescriptions')
          }}
        >
          Lihat Resep
        </Button>
      </div>
    </article>
  )
}

function CancelledCard({ appt }: { appt: Appointment }) {
  const navigate = useNavigate()
  const branch = getBranch(appt.branchId)
  const exam = serviceOf(appt)
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2 pb-2.5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Layanan Klinis
          </span>
          <h4 className="text-sm font-bold text-ink">{exam.name}</h4>
        </div>
        <StatusPill status={appt.status} />
      </div>
      <div className="space-y-2 border-t border-line pt-2.5 text-xs">
        <p className="flex items-center gap-2 text-ink-muted">
          <Icon name="event_busy" size={15} className="shrink-0 text-error" />
          {formatDateFull(appt.date)} · {appt.time} WIB
        </p>
        <p className="flex items-center gap-2 text-ink-muted">
          <Icon name="storefront" size={15} className="shrink-0 text-brand" />
          {branch?.name}
        </p>
        <p className="flex gap-2 rounded-lg bg-canvas p-2.5 text-[11px] text-ink-muted">
          <Icon name="info" size={14} className="shrink-0 text-brand" />
          Catatan: Dibatalkan oleh pasien
        </p>
      </div>
      <div className="mt-3 border-t border-line pt-3">
        <Button
          size="sm"
          variant="outline"
          fullWidth
          className="rounded-lg"
          leadingIcon="replay"
          onClick={() => navigate('/booking')}
        >
          Booking Ulang
        </Button>
      </div>
    </article>
  )
}
