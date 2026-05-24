import { ClerkProvider } from '@clerk/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkConnectedApp } from './features/auth/ClerkConnectedApp'
import { AuthSessionProvider, type AuthSessionState } from './features/auth/authSessionContext'
import { clerkPublishableKey } from './lib/clerk'
import { registerAppServiceWorker } from './lib/pwa'

const anonymousSession: AuthSessionState = {
  canUseBackendAccount: true,
  isConfigured: false,
  isLoaded: true,
  isSignedIn: true,
  requiresAccount: false,
}

const app = clerkPublishableKey ? (
  <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
    <ClerkConnectedApp />
  </ClerkProvider>
) : (
  <AuthSessionProvider value={anonymousSession}>
    <App />
  </AuthSessionProvider>
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
