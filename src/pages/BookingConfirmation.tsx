import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StickyBar } from '../components/layout/Layout'
import { BookingSteps } from '../components/booking/BookingSteps'
import { BottomNav } from '../components/navigation/BottomNav'
import { Button, IconButton } from '../components/ui/Button'
import { BottomSheet } from '../components/ui/BottomSheet'
import { Icon } from '../components/ui/Icon'
import { ToastHost } from '../components/ui/Toast'
import { EXAM_TYPES } from '../data/appointments'
import { getBranch } from '../data/branches'
import { useAppointments } from '../store/AppointmentContext'
import { useBooking } from '../store/BookingContext'
import { useToast } from '../store/ToastContext'
import { cn } from '../utils/cn'
import { formatDateFull, formatRupiah, formatWeekdayLong } from '../utils/format'

export function BookingConfirmation() {
  const navigate = useNavigate()
  const { draft, patch } = useBooking()
  const { book } = useAppointments()
  const { push } = useToast()
  const [patientSheet, setPatientSheet] = useState(false)
  const [name, setName] = useState(draft.patientName)
  const [phone, setPhone] = useState(draft.phone)

  const exam = EXAM_TYPES.find((e) => e.id === draft.service) ?? EXAM_TYPES[0]
  const branch = getBranch(draft.branchId)
  const ready = Boolean(draft.date && draft.time)

  useEffect(() => {
    if (!ready) navigate('/booking', { replace: true })
  }, [ready, navigate])

  if (!ready) return null

  const contact = draft.phone.trim() || '+62 812-3456-7890'

  function confirm() {
    const appt = book({
      branchId: draft.branchId,
      date: draft.date,
      time: draft.time,
      type: 'eye-check',
      optometrist: 'Dr. Andika Pratama, Sp.M',
      service: draft.service,
      patientName: draft.patientName.trim() || 'Ariq Athallah',
      relation: draft.forSelf ? 'Saya Sendiri' : 'Orang Lain',
      phone: contact,
      note: draft.note,
    })
    navigate(`/booking/success?appt=${encodeURIComponent(appt.id)}`, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Konfirmasi Booking"
        actions={
          <IconButton
            name="help_outline"
            label="Bantuan"
            onClick={() => push('Hubungi OptiCare di 0800-1234', 'info')}
          />
        }
      />
      <BookingSteps current={3} />

      <main className="flex-1 space-y-4 px-5 pb-36 pt-5">
        <div>
          <h2 className="text-[19px] font-bold text-ink">Konfirmasi Booking</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Pastikan detail pemeriksaan sudah sesuai sebelum melanjutkan.
          </p>
        </div>

        {/* Jadwal & layanan */}
        <Card
          icon="calendar_today"
          title="Jadwal & Jenis Layanan"
          action={
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Ubah
            </button>
          }
        >
          <Row label="Layanan" value={exam.name} />
          <Row label="Hari & Tanggal" value={`${formatWeekdayLong(draft.date)}, ${formatDateFull(draft.date)}`} />
          <Row
            label="Waktu & Durasi"
            value={`${draft.time} WIB (±${exam.duration} mnt)`}
          />
        </Card>

        {/* Lokasi */}
        <Card
          icon="store"
          title="Lokasi Cabang"
          action={
            <button
              type="button"
              onClick={() => navigate('/booking/location')}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Ubah
            </button>
          }
        >
          <p className="text-sm font-bold text-ink">{branch?.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-success">
            <Icon name="check_circle" size={14} />
            Buka · {branch?.hours}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {branch?.address} ({branch?.distanceKm} km)
          </p>
          <p className="mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-[11px] text-ink-muted">
            <Icon name="verified" size={14} className="text-brand" />
            Optometris Berlisensi OptiCare
          </p>
        </Card>

        {/* Pasien */}
        <Card
          icon="person"
          title="Data Pasien"
          action={
            <button
              type="button"
              onClick={() => {
                setName(draft.patientName)
                setPhone(draft.phone)
                setPatientSheet(true)
              }}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Ubah Pasien
            </button>
          }
        >
          <p className="text-sm font-bold text-ink">{draft.patientName}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {draft.forSelf ? 'Pemeriksaan Pribadi (Saya Sendiri)' : 'Orang Lain'}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs">
            <Icon name="badge" size={14} className="text-brand" />
            <span className="text-ink-muted">Nomor Kontak</span>
            <span className="font-semibold text-ink">{contact}</span>
          </p>
          {draft.note && (
            <p className="mt-2 border-t border-line pt-2 text-xs text-ink-muted">
              Catatan / Keluhan:
              <span className="mt-0.5 block font-medium text-ink">"{draft.note}"</span>
            </p>
          )}
        </Card>

        {/* Panduan */}
        <Card icon="info" title="Panduan Pemeriksaan">
          <ul className="space-y-1.5 text-xs leading-snug text-ink-muted">
            <li>
              • Harap datang{' '}
              <span className="font-semibold text-ink">10 menit</span> sebelum jadwal
              pemeriksaan.
            </li>
            <li>
              • Bawa kacamata lama atau resep sebelumnya jika tersedia.
            </li>
            <li>
              • Pembatalan &amp; ubah jadwal gratis hingga{' '}
              <span className="font-semibold text-ink">2 jam</span> sebelum waktu temu.
            </li>
          </ul>
        </Card>

        {/* Biaya */}
        <Card icon="receipt_long" title="Ringkasan Biaya">
          <Row label="Biaya Pemeriksaan" value={exam.price === 0 ? 'Rp 0 (Gratis)' : formatRupiah(exam.price)} />
          <Row label="Konsultasi Optometris" value="Rp 0 (Termasuk)" />
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-2.5">
            <span className="text-xs font-bold text-ink">Total Pembayaran</span>
            <span className="text-[17px] font-bold text-ink">
              {formatRupiah(exam.price)}
            </span>
          </div>
        </Card>
      </main>

      <BottomSheet
        open={patientSheet}
        onClose={() => setPatientSheet(false)}
        title="Ubah Data Pasien"
        footer={
          <Button
            fullWidth
            className="rounded-xl"
            onClick={() => {
              patch({
                patientName: name.trim() || draft.patientName,
                phone: phone.trim() || draft.phone,
                forSelf: name.trim() === '' || name.trim() === 'Ariq Athallah',
              })
              setPatientSheet(false)
              push('Data pasien diperbarui')
            }}
          >
            Simpan
          </Button>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-ink">
            Nama Pasien
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-line-input bg-surface px-3.5 text-xs font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <label className="block text-xs font-semibold text-ink">
            Nomor Kontak
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-line-input bg-surface px-3.5 font-mono text-xs font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
        </div>
      </BottomSheet>

      <StickyBar>
        <Button fullWidth size="lg" className="h-12 rounded-xl" onClick={confirm}>
          Konfirmasi Booking
        </Button>
        <button
          type="button"
          onClick={() => navigate('/booking/location')}
          className="mt-2 w-full text-center text-xs font-semibold text-brand hover:underline"
        >
          Kembali ke Pilihan Lokasi
        </button>
      </StickyBar>

      <BottomNav />
      <ToastHost />
    </>
  )
}

function Card({
  icon,
  title,
  action,
  children,
}: {
  icon: string
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-bold text-ink">
          <Icon name={icon} size={17} className="text-brand" />
          {title}
        </h3>
        {action}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-ink-muted">{label}</span>
      <span className={cn('text-right font-semibold text-ink')}>{value}</span>
    </div>
  )
}
