import { Router } from './app/router'
import { AppProviders } from './store'

export default function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  )
}
