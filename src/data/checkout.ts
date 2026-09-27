export interface Address {
  id: string
  label: string
  recipient: string
  phone: string
  line: string
  isDefault: boolean
}

export interface ShippingOption {
  id: string
  name: string
  detail: string
  eta: string
  price: number
}

export interface PaymentOption {
  id: string
  name: string
  detail: string
  badge?: string
  icon: string
}

export const addresses: Address[] = [
  {
    id: 'addr-main',
    label: 'Alamat Utama',
    recipient: 'Ariq Athallah',
    phone: '+62 812-3456-7890',
    line: 'Jl. Khatib Sulaiman No. 10, Lolong Belanti, Kec. Padang Utara, Kota Padang, Sumatera Barat 25136',
    isDefault: true,
  },
  {
    id: 'addr-office',
    label: 'Kantor',
    recipient: 'Ariq Athallah',
    phone: '+62 812-3456-7890',
    line: 'Jl. Sudirman No. 128, Padang Pasir, Kec. Padang Barat, Kota Padang, Sumatera Barat 25111',
    isDefault: false,
  },
]

export const shippingOptions: ShippingOption[] = [
  {
    id: 'regular',
    name: 'Reguler (2–4 hari kerja)',
    detail: 'J&T Express · SiCepat · Kemasan Hardbox Optik',
    eta: '2–4 hari kerja',
    price: 20_000,
  },
  {
    id: 'express',
    name: 'Express (1–2 hari kerja)',
    detail: 'Next Day Priority Courier',
    eta: '1–2 hari kerja',
    price: 35_000,
  },
  {
    id: 'pickup',
    name: 'Ambil di Optik',
    detail: 'Cabang OptiCare · Bebas Ongkir',
    eta: 'Siap 2 jam setelah QC',
    price: 0,
  },
]

export const paymentOptions: PaymentOption[] = [
  {
    id: 'qris',
    name: 'QRIS',
    detail: 'BCA, Mandiri, GoPay, OVO, ShopeePay',
    badge: 'Instant',
    icon: 'qr_code_2',
  },
  {
    id: 'bca-va',
    name: 'BCA Virtual Account',
    detail: 'Bank Transfer · Verifikasi otomatis 24 jam',
    icon: 'account_balance',
  },
  {
    id: 'ewallet',
    name: 'E-Wallet (GoPay / OVO / Dana)',
    detail: 'Terkoneksi langsung ke aplikasi',
    icon: 'account_balance_wallet',
  },
  {
    id: 'card',
    name: 'Kartu Debit / Kredit',
    detail: 'Visa, Mastercard, JCB (3D Secure)',
    icon: 'credit_card',
  },
]

export interface Promo {
  code: string
  label: string
  description: string
  amount: number
  minTotal: number
}

export const promos: Promo[] = [
  {
    code: 'OPTICARE10',
    label: 'OPTICARE10',
    description: 'Hemat Rp100.000 untuk transaksi pertama',
    amount: 100_000,
    minTotal: 500_000,
  },
  {
    code: 'LENSA50',
    label: 'LENSA50',
    description: 'Potongan Rp50.000 khusus lensa',
    amount: 50_000,
    minTotal: 250_000,
  },
]

export function findPromo(code: string): Promo | undefined {
  const normalized = code.trim().toUpperCase()
  return promos.find((p) => p.code === normalized)
}
