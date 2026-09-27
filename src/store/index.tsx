import type { ReactNode } from 'react'
import { AppointmentProvider } from './AppointmentContext'
import { BookingProvider } from './BookingContext'
import { CartProvider } from './CartContext'
import { CheckoutProvider } from './CheckoutContext'
import { FavoritesProvider } from './FavoritesContext'
import { OrderProvider } from './OrderContext'
import { PrescriptionProvider } from './PrescriptionContext'
import { ProfileProvider } from './ProfileContext'
import { ToastProvider } from './ToastContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ProfileProvider>
        <PrescriptionProvider>
          <FavoritesProvider>
            <CartProvider>
              <CheckoutProvider>
                <OrderProvider>
                  <AppointmentProvider>
                  <BookingProvider>{children}</BookingProvider>
                </AppointmentProvider>
                </OrderProvider>
              </CheckoutProvider>
            </CartProvider>
          </FavoritesProvider>
        </PrescriptionProvider>
      </ProfileProvider>
    </ToastProvider>
  )
}
