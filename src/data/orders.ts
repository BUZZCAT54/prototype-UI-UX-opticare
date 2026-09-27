import type { Order, OrderStatus } from '../types'

export interface OrderStatusMeta {
  id: OrderStatus
  label: string
  shortLabel: string
  icon: string
  stage: number
  description: string
}

export const ORDER_STAGES: OrderStatusMeta[] = [
  {
    id: 'confirmed',
    label: 'Pesanan Dikonfirmasi',
    shortLabel: 'Dikonfirmasi',
    icon: 'check',
    stage: 1,
    description: 'Pesanan dan pembayaran berhasil diverifikasi otomatis.',
  },
  {
    id: 'lens-processing',
    label: 'Lensa Sedang Diproses',
    shortLabel: 'Sedang Dibuat',
    icon: 'visibility',
    stage: 2,
    description: 'Lensa dipotong dan dirakit di lab optik sesuai resep.',
  },
  {
    id: 'quality-check',
    label: 'Quality Check',
    shortLabel: 'QC',
    icon: 'fact_check',
    stage: 3,
    description: 'Frame dan fokus lensa diuji ketepatannya oleh optometris berlisensi.',
  },
  {
    id: 'shipping',
    label: 'Dalam Pengiriman',
    shortLabel: 'Dikirim',
    icon: 'local_shipping',
    stage: 4,
    description: 'Paket dikemas dengan hardbox optik anti-benturan dan diserahkan ke kurir.',
  },
  {
    id: 'completed',
    label: 'Pesanan Selesai',
    shortLabel: 'Selesai',
    icon: 'sentiment_satisfied',
    stage: 5,
    description: 'Paket diterima dengan selamat disertai garansi 14 hari kenyamanan fokus.',
  },
]

export const CANCELLED_STATUS: OrderStatusMeta = {
  id: 'cancelled',
  label: 'Dibatalkan',
  shortLabel: 'Dibatalkan',
  icon: 'cancel',
  stage: 0,
  description: 'Pesanan dibatalkan dan dana dikembalikan.',
}

export function getStatusMeta(status: OrderStatus): OrderStatusMeta {
  if (status === 'cancelled') return CANCELLED_STATUS
  return ORDER_STAGES.find((s) => s.id === status) ?? ORDER_STAGES[0]
}

export const defaultOrders: Order[] = [
  {
    id: 'opt-290926-014',
    code: 'OPT-290926-014',
    createdAt: '2026-09-29',
    items: [
      {
        productId: 'rayban-rb2140',
        brand: 'Ray-Ban',
        name: 'RB2140 Classic Wayfarer',
        image: '/images/frame-rayban-front.jpg',
        colorName: 'Glossy Black',
        lensName: 'Blue Light Filter',
        qty: 1,
        price: 2_100_000,
      },
    ],
    itemCount: 1,
    subtotal: 2_100_000,
    discount: 100_000,
    shippingCost: 20_000,
    total: 2_020_000,
    status: 'lens-processing',
    fulfilment: 'delivery',
    paymentMethod: 'QRIS Instant',
    address: 'Jl. Khatib Sulaiman No. 10, Lolong Belanti, Kec. Padang Utara, Kota Padang, Sumatera Barat 25136',
    courier: 'J&T Express (Reguler)',
    resi: 'JT00392182011',
    timeline: [
      { status: 'confirmed', at: '2026-09-29T14:32:00+07:00', note: 'Pembayaran QRIS diverifikasi otomatis.' },
      { status: 'lens-processing', at: '2026-09-30T09:15:00+07:00', note: 'Lensa Blue Light dipotong sesuai resep OD -1.50 / OS -1.25.' },
    ],
  },
  {
    id: 'opt-150926-009',
    code: 'OPT-150926-009',
    createdAt: '2026-09-24',
    items: [
      {
        productId: 'oakley-holbrook',
        brand: 'Oakley',
        name: 'Holbrook RX Classic',
        image: '/images/order-frame-tortoise.jpg',
        colorName: 'Matte Tortoise',
        lensName: 'Single Vision AR',
        qty: 1,
        price: 2_200_000,
      },
    ],
    itemCount: 1,
    subtotal: 2_200_000,
    discount: 0,
    shippingCost: 35_000,
    total: 2_235_000,
    status: 'shipping',
    fulfilment: 'delivery',
    paymentMethod: 'BCA Virtual Account',
    address: 'Jl. Khatib Sulaiman No. 42, RT 02 / RW 05, Ulak Karang Selatan, Kota Padang, Sumatera Barat 25133',
    courier: 'SiCepat · Express (1–2 hari)',
    resi: '00392182011',
    timeline: [
      { status: 'confirmed', at: '2026-09-24T10:04:00+07:00' },
      { status: 'lens-processing', at: '2026-09-25T08:40:00+07:00' },
      { status: 'quality-check', at: '2026-09-26T13:20:00+07:00', note: 'Fokus lensa lolos uji optometris.' },
      { status: 'shipping', at: '2026-09-27T16:10:00+07:00', note: 'Paket diserahkan ke SiCepat.' },
    ],
  },
  {
    id: 'opt-050926-002',
    code: 'OPT-050926-002',
    createdAt: '2026-09-05',
    items: [
      {
        productId: 'vogue-vo5276',
        brand: 'Vogue Eyewear',
        name: 'VO5276 Minimalist',
        image: '/images/order-frame-crystal.jpg',
        colorName: 'Crystal Clear',
        lensName: 'Blue Light Lens',
        qty: 1,
        price: 1_650_000,
      },
    ],
    itemCount: 1,
    subtotal: 1_650_000,
    discount: 100_000,
    shippingCost: 0,
    total: 1_550_000,
    status: 'completed',
    fulfilment: 'pickup',
    paymentMethod: 'QRIS Instant',
    branchId: 'padang-khatib',
    timeline: [
      { status: 'confirmed', at: '2026-09-05T11:12:00+07:00' },
      { status: 'lens-processing', at: '2026-09-06T09:00:00+07:00' },
      { status: 'quality-check', at: '2026-09-07T10:30:00+07:00' },
      { status: 'shipping', at: '2026-09-08T09:45:00+07:00', note: 'Siap diambil di OptiCare Padang.' },
      { status: 'completed', at: '2026-09-08T15:20:00+07:00', note: 'Diterima oleh Budi (Penerima).' },
    ],
  },
  {
    id: 'opt-220826-011',
    code: 'OPT-220826-011',
    createdAt: '2026-08-22',
    items: [
      {
        productId: 'opticare-studio-45',
        brand: 'OptiCare',
        name: 'Studio 45',
        image: '/images/order-frame-black.jpg',
        colorName: 'Matte Black',
        lensName: null,
        qty: 1,
        price: 850_000,
      },
    ],
    itemCount: 1,
    subtotal: 850_000,
    discount: 0,
    shippingCost: 0,
    total: 850_000,
    status: 'cancelled',
    fulfilment: 'delivery',
    paymentMethod: 'E-Wallet (GoPay)',
    timeline: [
      { status: 'confirmed', at: '2026-08-22T19:05:00+07:00' },
      { status: 'cancelled', at: '2026-08-23T08:30:00+07:00', note: 'Dibatalkan oleh pembeli · Dana telah dikembalikan.' },
    ],
  },
]

export const ORDER_TABS: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'lens-processing', label: 'Diproses' },
  { id: 'shipping', label: 'Dikirim' },
  { id: 'completed', label: 'Selesai' },
]

export function getOrder(id: string | undefined): Order | undefined {
  return defaultOrders.find((o) => o.id === id)
}
