import { ClerkProvider } from '@clerk/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { clerkPublishableKey } from './lib/clerk'
import { registerAppServiceWorker } from './lib/pwa'

const app = clerkPublishableKey ? (
  <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
    <App />
  </ClerkProvider>
) : (
  <App />
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {app}
  </StrictMode>,
)

const serviceWorker = registerAppServiceWorker()

if (serviceWorker.supported) {
  serviceWorker.ready.catch((error: unknown) => {
    if (import.meta.env.DEV) {
      console.error('Service worker readiness failed:', error)
    }
  })
}
