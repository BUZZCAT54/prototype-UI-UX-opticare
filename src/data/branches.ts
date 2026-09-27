import type { Branch } from '../types'

export const branches: Branch[] = [
  {
    id: 'padang-khatib',
    name: 'OptiCare Padang',
    address: 'Jl. Khatib Sulaiman No. 18, Padang',
    city: 'Padang',
    distanceKm: 1.2,
    phone: '+62 751 44118',
    hours: '09:00 – 21:00 WIB',
    services: ['Pemeriksaan Mata', 'Pemotongan Lensa', 'Perbaikan Frame'],
  },
  {
    id: 'padang-transmart',
    name: 'OptiCare Transmart',
    address: 'Jl. Khatib Sulaiman No. 3, Transmart Padang',
    city: 'Padang',
    distanceKm: 3.4,
    phone: '+62 751 44223',
    hours: '10:00 – 22:00 WIB',
    services: ['Pemeriksaan Mata', 'Konsultasi Lensa'],
  },
  {
    id: 'padang-ara',
    name: 'OptiCare Ara Paya',
    address: 'Jl. Raya Kp. Dalam No. 7, Ara Paya',
    city: 'Padang',
    distanceKm: 6.8,
    phone: '+62 751 44330',
    hours: '09:00 – 20:00 WIB',
    services: ['Pemeriksaan Mata', 'Pemotongan Lensa'],
  },
  {
    id: 'bukittinggi',
    name: 'OptiCare Bukittinggi',
    address: 'Jl. Ahmad Yani No. 21, Bukittinggi',
    city: 'Bukittinggi',
    distanceKm: 84.5,
    phone: '+62 752 23344',
    hours: '09:00 – 21:00 WIB',
    services: ['Pemeriksaan Mata', 'Pemotongan Lensa', 'Perbaikan Frame'],
  },
]

export function getBranch(id: string | null | undefined): Branch | undefined {
  if (!id) return undefined
  return branches.find((b) => b.id === id)
}
