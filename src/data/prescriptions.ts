import type { Prescription } from '../types'

export const defaultPrescriptions: Prescription[] = [
  {
    id: 'rx-2026-09-12',
    label: 'Resep 12 Sep 2026 (OptiCare Eye Check)',
    source: 'manual',
    createdAt: '2026-09-12',
    doctor: 'Dr. Andika Pratama, Sp.M (OptiCare Central)',
    od: { sph: '-1.50', cyl: '-0.50', axis: '180', add: '-', pd: '62' },
    os: { sph: '-1.25', cyl: '-0.25', axis: '175', add: '-', pd: '62' },
  },
  {
    id: 'rx-2025-03-14',
    label: '14 Maret 2025 · Pemeriksaan Mandiri',
    source: 'upload',
    createdAt: '2025-03-14',
    doctor: 'Klinik Mitra',
    od: { sph: '-1.00', cyl: '-0.50', axis: '180', add: '-', pd: '61' },
    os: { sph: '-1.00', cyl: '-0.25', axis: '175', add: '-', pd: '61' },
  },
]
