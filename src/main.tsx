import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerAppServiceWorker } from './lib/pwa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
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
