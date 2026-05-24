import { useAuth } from '@clerk/react'
import { useLayoutEffect } from 'react'
import App from '../../App.tsx'
import { setApiAuthTokenProvider } from '../../lib/apiClient'
import { AuthSessionProvider, type AuthSessionState } from './authSessionContext'

export function ClerkConnectedApp() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  useLayoutEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setApiAuthTokenProvider(undefined)
      return undefined
    }

    setApiAuthTokenProvider(() => getToken())
    return () => setApiAuthTokenProvider(undefined)
  }, [getToken, isLoaded, isSignedIn])

  const session: AuthSessionState = {
    canUseBackendAccount: isLoaded && Boolean(isSignedIn),
    isConfigured: true,
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    requiresAccount: isLoaded && !isSignedIn,
  }

  return (
    <AuthSessionProvider value={session}>
      <App />
    </AuthSessionProvider>
  )
}
