export type ID = string

export type Gender = 'pria' | 'wanita' | 'unisex'

export type FrameShape =
  | 'square'
  | 'round'
  | 'aviator'
  | 'cat-eye'
  | 'rectangle'
  | 'geometric'

export type LensTypeId =
  | 'clear'
  | 'blue-light'
  | 'photochromic'
  | 'progressive'
  | 'office'

export type Eye = 'od' | 'os'

export interface RxValues {
  sph: string
  cyl: string
  axis: string
  add: string
  pd: string
}

export interface Prescription {
  id: ID
  label: string
  source: 'upload' | 'manual'
  createdAt: string
  doctor?: string
  od: RxValues
  os: RxValues
}

export interface ProductColor {
  id: string
  name: string
  hex: string
}

export interface ProductSpecs {
  lensWidth: number
  bridge: number
  temple: number
  fit: string
}

export interface Product {
  id: ID
  brand: string
  name: string
  price: number
  rating: number
  reviews: number
  gender: Gender
  shape: FrameShape
  material: string
  colors: ProductColor[]
  images: string[]
  specs: ProductSpecs
  stock: number
  description: string
  compatibleLenses: LensTypeId[]
  highlight?: string
}

export interface LensOption {
  id: LensTypeId
  name: string
  shortName: string
  description: string
  price: number
  priceFrom: number
  recommended?: boolean
  icon: string
}

export interface Branch {
  id: ID
  name: string
  address: string
  city: string
  distanceKm: number
  phone: string
  hours: string
  services: string[]
}

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled'

export interface Appointment {
  id: ID
  code: string
  branchId: ID
  date: string
  time: string
  type: 'eye-check' | 'fitting' | 'consultation'
  status: AppointmentStatus
  optometrist?: string
  createdAt: string
  /** Jenis pemeriksaan (dasar / lengkap) sesuai layanan booking. */
  service?: 'basic' | 'full'
  patientName?: string
  relation?: string
  phone?: string
  note?: string
}

export type OrderStatus =
  | 'confirmed'
  | 'lens-processing'
  | 'quality-check'
  | 'shipping'
  | 'completed'
  | 'cancelled'

export type OrderFulfilment = 'delivery' | 'pickup'

export interface CartItem {
  id: ID
  productId: ID
  brand: string
  name: string
  image: string
  colorId: string
  colorName: string
  lensId: LensTypeId | null
  lensName: string | null
  lensPrice: number
  qty: number
  price: number
}

export interface OrderItem {
  productId: ID
  brand: string
  name: string
  image: string
  colorName: string
  lensName: string | null
  qty: number
  price: number
}

export interface TrackingEvent {
  status: OrderStatus
  at: string
  note?: string
}

export interface Order {
  id: ID
  code: string
  createdAt: string
  items: OrderItem[]
  itemCount: number
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  status: OrderStatus
  fulfilment: OrderFulfilment
  paymentMethod: string
  address?: string
  branchId?: ID
  resi?: string
  courier?: string
  timeline: TrackingEvent[]
}

export interface CheckoutState {
  fulfilment: OrderFulfilment
  addressId: string | null
  branchId: string | null
  shippingId: string | null
  paymentId: string | null
  promo: string | null
  note: string
}

export interface Profile {
  name: string
  email: string
  phone: string
  avatar: string
  memberSince: string
  /** ISO yyyy-MM-dd (opsional, diisi via Edit Profil). */
  birthDate?: string
  gender?: 'pria' | 'wanita'
}

export interface NotificationSetting {
  id: string
  label: string
  description: string
  enabled: boolean
}
