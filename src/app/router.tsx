import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/Layout'
import { Stub } from '../pages/Stub'
import { Home } from '../pages/Home'
import { Catalog } from '../pages/Catalog'
import { ProductDetail } from '../pages/ProductDetail'
import { LensSelection } from '../pages/LensSelection'
import { Prescription } from '../pages/Prescription'
import { Cart } from '../pages/Cart'
import { Checkout } from '../pages/Checkout'
import { Payment } from '../pages/Payment'
import { PaymentSuccess } from '../pages/PaymentSuccess'
import { PaymentFailed } from '../pages/PaymentFailed'
import { Booking } from '../pages/Booking'
import { BookingLocation } from '../pages/BookingLocation'
import { BookingConfirmation } from '../pages/BookingConfirmation'
import { BookingSuccess } from '../pages/BookingSuccess'
import { Appointments } from '../pages/Appointments'
import { AppointmentDetail } from '../pages/AppointmentDetail'
import { Orders } from '../pages/Orders'
import { OrderDetail } from '../pages/OrderDetail'
import { OrderTracking } from '../pages/OrderTracking'
import { Profile } from '../pages/Profile'
import { ProfileEdit } from '../pages/ProfileEdit'
import { SavedPrescriptions } from '../pages/SavedPrescriptions'
import { PrescriptionDetail } from '../pages/PrescriptionDetail'
import { NotificationPreferences } from '../pages/NotificationPreferences'

export function Router() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/lens-selection" element={<LensSelection />} />
        <Route path="/prescription" element={<Prescription />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking/location" element={<BookingLocation />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/:id" element={<AppointmentDetail />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/tracking/:id" element={<OrderTracking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/profile/prescriptions" element={<SavedPrescriptions />} />
        <Route path="/profile/prescriptions/:id" element={<PrescriptionDetail />} />
        <Route path="/profile/notifications" element={<NotificationPreferences />} />
        <Route path="*" element={<Stub title="Halaman tidak ditemukan" />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
