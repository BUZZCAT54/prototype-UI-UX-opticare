import type { NotificationSetting, Profile } from '../types'

export const defaultProfile: Profile = {
  name: 'Ariq Athallah',
  email: 'ariq@example.com',
  phone: '+62 812-3456-7890',
  avatar: '/images/avatar-ariq.jpg',
  memberSince: '2024-03-11',
}

export const defaultNotifications: NotificationSetting[] = [
  {
    id: 'order-status',
    label: 'Status Pesanan',
    description:
      'Update real-time progres faset lensa lab optik, uji kualitas, dan kurir pengiriman.',
    enabled: true,
  },
  {
    id: 'appointment-reminder',
    label: 'Pengingat Pemeriksaan',
    description:
      'Pengingat jadwal booking periksa mata di cabang dan rekomendasi cek ulang berkala.',
    enabled: true,
  },
  {
    id: 'promo',
    label: 'Promo',
    description: 'Diskon eksklusif frame branded, cashback voucher lensa, dan penawaran musiman.',
    enabled: false,
  },
  {
    id: 'product-info',
    label: 'Informasi Produk',
    description: 'Koleksi frame terbaru, rilis teknologi lensa pelindung, dan tips kesehatan mata.',
    enabled: true,
  },
]
