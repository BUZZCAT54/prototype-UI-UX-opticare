import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PageHeader, Section, StickyBar } from '../components/layout/Layout'
import { MonthCalendar } from '../components/booking/MonthCalendar'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { BottomSheet } from '../components/ui/BottomSheet'
import { Icon } from '../components/ui/Icon'
import { Modal } from '../components/ui/Modal'
import { ToastHost } from '../components/ui/Toast'
import { EXAM_TYPES, TIME_SLOTS } from '../data/appointments'
import { getBranch } from '../data/branches'
import { useAppointments } from '../store/AppointmentContext'
import { usePrescriptions } from '../store/PrescriptionContext'
import { useToast } from '../store/ToastContext'
import { cn } from '../utils/cn'
import { formatDateFull, formatDateShort, formatRupiah, formatWeekdayLong } from '../utils/format'

const FULL_SLOT = '11:00'

export function AppointmentDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const { get, reschedule, cancel } = useAppointments()
  const { active } = usePrescriptions()
  const { push } = useToast()

  const appt = get(id)
  const [resheet, setResheet] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [newDate, setNewDate] = useState(appt?.date ?? '')
  const [newTime, setNewTime] = useState(appt?.time ?? '')

  useEffect(() => {
    if (params.get('action') === 'reschedule') {
      setNewDate(appt?.date ?? '')
      setNewTime(appt?.time ?? '')
      setResheet(true)
      params.delete('action')
      setParams(params, { replace: true })
    }
  }, [params, setParams, appt])

  if (!appt) {
    return (
      <>
        <PageHeader title="Detail Pemeriksaan" />
        <main className="flex flex-1 items-center justify-center px-5 text-center">
          <p className="text-sm text-ink-muted">Janji temu tidak ditemukan.</p>
        </main>
        <BottomNav />
        <ToastHost />
      </>
    )
  }

  const branch = getBranch(appt.branchId)
  const exam = EXAM_TYPES.find((e) => e.id === appt.service) ?? EXAM_TYPES[0]
  const upcoming = appt.status === 'upcoming'
  const cancelled = appt.status === 'cancelled'

  return (
    <>
      <PageHeader
        title="Detail Pemeriksaan"
        actions={
          <IconButton
            name="help_outline"
            label="Bantuan"
            onClick={() => push('Hubungi OptiCare di 0800-1234', 'info')}
          />
        }
      />

      <main className="flex-1 space-y-4 px-5 pb-32 pt-4">
        {/* Kop */}
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold',
                upcoming && 'bg-brand-light text-brand',
                appt.status === 'completed' && 'bg-success/10 text-success',
                cancelled && 'bg-error/10 text-error',
              )}
            >
              <Icon
                name={upcoming ? 'schedule' : appt.status === 'completed' ? 'event_available' : 'event_busy'}
                size={13}
              />
              {upcoming ? 'Akan Datang' : appt.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
            </span>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(appt.code)
                push('Kode booking berhasil disalin!')
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors hover:text-brand"
            >
              <span className="font-mono">{appt.code}</span>
              <Icon name="content_copy" size={14} />
            </button>
          </div>
          <h2 className="mt-2.5 text-[17px] font-bold text-ink">{exam.name}</h2>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            Dipesan pada {formatWeekdayLong(appt.createdAt)}, {formatDateFull(appt.createdAt)} •{' '}
            10:14 WIB
          </p>
        </div>

        {/* Jadwal */}
        <Card icon="calendar_month" title="Jadwal & Waktu Konsultasi">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-ink-muted">Tanggal</p>
              <p className="mt-0.5 font-semibold text-ink">
                {formatWeekdayLong(appt.date)}, {formatDateFull(appt.date)}
              </p>
            </div>
            <div>
              <p className="text-ink-muted">Waktu</p>
              <p className="mt-0.5 font-semibold text-ink">{appt.time} WIB</p>
            </div>
          </div>
          <p className="border-t border-line pt-2 text-[11px] text-ink-muted">
            Estimasi durasi ±{exam.duration} menit
          </p>
        </Card>

        {/* Layanan */}
        <Card icon="visibility" title="Jenis Layanan">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted">Layanan</span>
            <span className="font-semibold text-ink">{exam.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted">Biaya</span>
            <span className="font-semibold text-success">
              {exam.price === 0 ? 'Gratis / Rp 0' : formatRupiah(exam.price)}
            </span>
          </div>
        </Card>

        {/* Lokasi */}
        <Card icon="storefront" title="Lokasi Cabang">
          <p className="text-sm font-bold text-ink">{branch?.name}</p>
          <p className="mt-0.5 flex items-start gap-1.5 text-xs text-ink-muted">
            <Icon name="pin_drop" size={14} className="mt-0.5 shrink-0 text-brand" />
            {branch?.address} ({branch?.distanceKm} km)
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
            <Icon name="schedule" size={14} className="text-brand" />
            Jam Operasional: <span className="font-semibold text-ink">{branch?.hours}</span>
          </p>
          <p className="mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-[11px] text-success">
            <Icon name="verified" size={14} />
            Diverifikasi oleh optometris berlisensi OptiCare
          </p>
          <div className="mt-2.5 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-lg"
              leadingIcon="map"
              onClick={() => push('Membuka peta cabang OptiCare', 'info')}
            >
              Lihat di Peta
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-lg"
              leadingIcon="call"
              onClick={() => push(`Menghubungi ${branch?.name}`, 'info')}
            >
              Hubungi Cabang
            </Button>
          </div>
        </Card>

        {/* Pasien */}
        <Card icon="person" title="Data Pasien">
          <Row label="Nama Pasien" value={appt.patientName ?? 'Ariq Athallah'} />
          <Row label="Hubungan" value={appt.relation ?? 'Saya Sendiri'} />
          <Row label="Nomor Telepon" value={appt.phone ?? '+62 812-3456-7890'} />
          <div className="border-t border-line pt-2 text-xs">
            <p className="text-ink-muted">Keluhan / Catatan</p>
            <p className="mt-0.5 text-xs font-medium text-ink">
              {appt.note || 'Pemeriksaan rutin tahunan & update resep kacamata'}
            </p>
          </div>
        </Card>

        {/* Panduan */}
        <Card icon="info" title="Panduan & Pengingat Kedatangan">
          <ul className="space-y-2 text-xs leading-snug text-ink-muted">
            <li>
              • Harap datang <span className="font-semibold text-ink">10 menit</span> sebelum
              jadwal pemeriksaan untuk konfirmasi data diri di meja reservasi.
            </li>
            <li>
              • Bawa kacamata lama atau catatan resep sebelumnya jika tersedia untuk komparasi
              ketajaman visual.
            </li>
            <li>
              • Ubah jadwal atau pembatalan bebas biaya hingga{' '}
              <span className="font-semibold text-ink">2 jam</span> sebelum waktu pemeriksaan.
            </li>
          </ul>
        </Card>

        {/* Rekam medis (selesai) */}
        {appt.status === 'completed' && active && (
          <Section title="Rekam Medis Terhubung">
            <div className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between pb-2.5">
                <span className="text-xs font-bold text-ink">Hasil Pemeriksaan Terakhir</span>
                <span className="text-[11px] font-semibold text-ink-muted">
                  {formatDateShort(active.createdAt)}
                </span>
              </div>
              <div className="space-y-1.5 rounded-lg border border-line bg-canvas p-2.5">
                <div className="grid grid-cols-4 border-b border-line pb-1 text-center text-[11px] font-semibold text-ink-muted">
                  <span className="text-left">Mata</span>
                  <span>SPH</span>
                  <span>CYL</span>
                  <span>AXIS</span>
                </div>
                {(
                  [
                    ['OD', '(Kanan)', active.od],
                    ['OS', '(Kiri)', active.os],
                  ] as const
                ).map(([code, side, eye], i) => (
                  <div
                    key={code}
                    className={cn(
                      'grid grid-cols-4 items-center pt-0.5 text-xs font-medium text-ink',
                      i === 1 && 'border-t border-line pt-1.5',
                    )}
                  >
                    <span className="flex items-center gap-1 text-left font-bold text-brand">
                      {code} <span className="text-[10px] font-normal text-ink-muted">{side}</span>
                    </span>
                    <span className="text-center font-mono">{eye.sph}</span>
                    <span className="text-center font-mono">{eye.cyl}</span>
                    <span className="text-center font-mono">{eye.axis}°</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-ink-muted">Pupillary Distance (PD)</span>
                <span className="font-mono font-bold text-ink">{active.od.pd} mm</span>
              </div>
              <p className="mt-2.5 flex gap-1.5 rounded-lg bg-brand-light p-2.5 text-[11px] leading-snug">
                <Icon name="recommend" size={14} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  <span className="font-semibold text-ink">Rekomendasi Lensa:</span> Blue Light
                  Filter untuk aktivitas digital intensif harian.
                </span>
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-lg"
                  onClick={() => navigate('/profile/prescriptions')}
                >
                  Lihat Resep Mata
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 rounded-lg"
                  onClick={() => navigate('/catalog')}
                >
                  Gunakan Belanja
                </Button>
              </div>
            </div>
          </Section>
        )}
      </main>

      {/* Aksi utama */}
      <StickyBar>
        {upcoming ? (
          <div className="flex gap-2.5">
            <Button
              className="h-12 flex-1 rounded-xl"
              leadingIcon="edit_calendar"
              onClick={() => {
                setNewDate(appt.date)
                setNewTime(appt.time)
                setResheet(true)
              }}
            >
              Ubah Jadwal
            </Button>
            <Button
              variant="danger"
              className="h-12 flex-1 rounded-xl"
              leadingIcon="event_busy"
              onClick={() => setConfirmCancel(true)}
            >
              Batalkan Booking
            </Button>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl"
              onClick={() => navigate('/appointments')}
            >
              Riwayat Pemeriksaan
            </Button>
            <Button
              className="h-12 flex-1 rounded-xl"
              leadingIcon="replay"
              onClick={() => navigate('/booking')}
            >
              Booking Ulang
            </Button>
          </div>
        )}
      </StickyBar>

      {/* Reschedule */}
      <BottomSheet
        open={resheet}
        onClose={() => setResheet(false)}
        title="Ubah Jadwal"
        className="max-h-[92vh] overflow-y-auto"
        footer={
          <div className="space-y-2">
            <Button
              fullWidth
              className="rounded-xl"
              disabled={!newDate || !newTime || newTime === FULL_SLOT}
              onClick={() => {
                reschedule(appt.id, newDate, newTime)
                setResheet(false)
                push('Jadwal berhasil diperbarui & pengingat dikirim via WhatsApp')
              }}
            >
              Simpan Jadwal Baru
            </Button>
            <Button
              fullWidth
              variant="quiet"
              className="rounded-xl"
              onClick={() => setResheet(false)}
            >
              Batal, Pertahankan Jadwal Lama
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5">
          <div className="space-y-2.5 rounded-xl border border-line bg-canvas p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">Jadwal Saat Ini</span>
              <span className="rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                Bebas Biaya
              </span>
            </div>
            <p className="font-mono text-xs text-ink-muted">{appt.code}</p>
            <p className="text-xs font-semibold text-ink">{exam.name}</p>
            <p className="text-[11px] text-ink-muted">
              {appt.patientName ?? 'Ariq Athallah'} · 1 Pasien (Dewasa)
            </p>
            <div className="grid grid-cols-2 gap-2 border-t border-line pt-2.5 text-xs">
              <div>
                <p className="text-[11px] text-ink-muted">Jadwal Lama</p>
                <p className="font-semibold text-ink">
                  {formatDateFull(appt.date)} · {appt.time} WIB
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-muted">Cabang Optik</p>
                <p className="font-semibold text-ink">{branch?.name}</p>
              </div>
            </div>
            <p className="flex gap-1.5 rounded-lg bg-surface p-2 text-[11px] leading-snug text-ink-muted">
              <Icon name="info" size={14} className="mt-0.5 shrink-0 text-brand" />
              Perubahan jadwal gratis hingga 2 jam sebelum waktu kunjungan.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-ink">Pilih Tanggal Baru</h4>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              Pilih tanggal dan waktu kunjungan pengganti yang tersedia.
            </p>
          </div>

          <MonthCalendar value={newDate} onChange={setNewDate} />

          <section className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-baseline justify-between">
              <h4 className="text-xs font-bold text-ink">Pilih Jam Kunjungan</h4>
              <span className="text-[11px] text-ink-muted">Zona Waktu: WIB</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => {
                const full = slot === FULL_SLOT
                const old = slot === appt.time
                const selected = slot === newTime
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={full}
                    onClick={() => setNewTime(slot)}
                    className={cn(
                      'relative h-10 rounded-lg border text-xs font-semibold transition-colors',
                      full && 'cursor-not-allowed border-line-input bg-canvas text-line-input',
                      !full && selected && 'border-brand bg-brand text-white',
                      !full && !selected && 'border-line-input bg-canvas text-ink hover:border-brand',
                    )}
                  >
                    {slot}
                    {old && !selected && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded bg-ink px-1 text-[9px] font-semibold text-white">
                        Lama
                      </span>
                    )}
                    {full && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded bg-line px-1 text-[9px] font-semibold text-ink-muted">
                        Penuh
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center gap-1.5 pb-2.5">
              <Icon name="update" size={16} className="text-brand" />
              <h4 className="text-xs font-bold text-ink">Ringkasan Perubahan Jadwal</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-canvas p-2.5">
                <p className="text-[11px] text-ink-muted">Sebelumnya</p>
                <p className="text-xs font-semibold text-ink">{formatDateFull(appt.date)}</p>
                <p className="text-xs font-semibold text-ink">{appt.time} WIB</p>
              </div>
              <div className="rounded-lg border border-brand/30 bg-brand-light p-2.5">
                <p className="text-[11px] text-ink-muted">Jadwal Baru</p>
                <p className="text-xs font-semibold text-ink">
                  {newDate ? formatDateFull(newDate) : '-'}
                </p>
                <p className="text-xs font-semibold text-brand">{newTime || '-'} WIB</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-ink-muted">
              Konfirmasi dan pengingat jadwal baru akan otomatis dikirimkan via WhatsApp dan
              tersimpan di akun Anda.
            </p>
          </section>
        </div>
      </BottomSheet>

      {/* Cancel */}
      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        tone="danger"
        icon="event_busy"
        title="Batalkan Booking?"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" fullWidth onClick={() => setConfirmCancel(false)}>
              Kembali
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                cancel(appt.id)
                setConfirmCancel(false)
                push('Booking dibatalkan. Kamu bisa booking ulang kapan saja.', 'info')
              }}
            >
              Ya, Batalkan
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-muted">
          Jadwal{' '}
          <span className="font-semibold text-ink">
            {formatDateFull(appt.date)} · {appt.time}
          </span>{' '}
          di <span className="font-semibold text-ink">{branch?.name}</span> akan dibatalkan.
          Pembatalan gratis hingga 2 jam sebelumnya.
        </p>
        <p className="mt-2 flex gap-1.5 rounded-lg bg-canvas p-2.5 text-[11px] leading-snug text-ink-muted">
          <Icon name="info" size={14} className="mt-0.5 shrink-0 text-brand" />
          Kamu selalu dapat melakukan booking ulang jadwal kapan saja melalui layanan OptiCare.
        </p>
      </Modal>

      <BottomNav />
      <ToastHost />
    </>
  )
}

function Card({
  icon,
  title,
  children,
}: {
  icon: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-ink">
        <Icon name={icon} size={17} className="text-brand" />
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  )
}
