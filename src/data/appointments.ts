import type { Appointment, AppointmentStatus } from '../types'

export const defaultAppointments: Appointment[] = [
  {
    id: 'appt-001',
    code: 'EYE-290926-008',
    branchId: 'padang-khatib',
    date: '2026-09-29',
    time: '14:00',
    type: 'eye-check',
    status: 'upcoming',
    optometrist: 'Dr. Andika Pratama, Sp.M',
    createdAt: '2026-09-24',
    service: 'basic',
    patientName: 'Ariq Athallah',
    relation: 'Saya Sendiri',
    phone: '+62 812-3456-7890',
    note: 'Pemeriksaan rutin & update ukuran kacamata',
  },
  {
    id: 'appt-002',
    code: 'EYE-120926-004',
    branchId: 'padang-khatib',
    date: '2026-09-12',
    time: '10:30',
    type: 'eye-check',
    status: 'completed',
    optometrist: 'Dr. Andika Pratama, Sp.M',
    createdAt: '2026-09-08',
    service: 'full',
    patientName: 'Ariq Athallah',
    relation: 'Saya Sendiri',
    phone: '+62 812-3456-7890',
    note: 'Pemeriksaan rutin tahunan',
  },
  {
    id: 'appt-003',
    code: 'EYE-020826-011',
    branchId: 'padang-transmart',
    date: '2026-08-02',
    time: '16:00',
    type: 'eye-check',
    status: 'cancelled',
    createdAt: '2026-07-28',
    service: 'basic',
    patientName: 'Ariq Athallah',
    relation: 'Saya Sendiri',
    phone: '+62 812-3456-7890',
  },
]

export const APPOINTMENT_TABS: { id: AppointmentStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'upcoming', label: 'Akan Datang' },
  { id: 'completed', label: 'Selesai' },
  { id: 'cancelled', label: 'Dibatalkan' },
]

export const EXAM_TYPES = [
  {
    id: 'basic',
    name: 'Pemeriksaan Mata Dasar',
    price: 0,
    duration: 20,
    description:
      'Pemeriksaan ketajaman penglihatan (visus) dan ukuran mata (refraksi minus/plus/silinder).',
  },
  {
    id: 'full',
    name: 'Pemeriksaan Lengkap',
    price: 75_000,
    duration: 30,
    description:
      'Pemeriksaan mata komprehensif dengan analisis kejernihan lensa & tekanan mata.',
  },
] as const

export const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
