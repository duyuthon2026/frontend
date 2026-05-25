import { createContext, createElement, useContext, type ReactNode } from 'react'
import { isClerkConfigured } from '../../lib/clerk'

export type AuthSessionState = {
  canUseBackendAccount: boolean
  isConfigured: boolean
  isLoaded: boolean
  isSignedIn: boolean
  requiresAccount: boolean
}

const anonymousBackendSession: AuthSessionState = {
  canUseBackendAccount: !isClerkConfigured,
  isConfigured: isClerkConfigured,
  isLoaded: !isClerkConfigured,
  isSignedIn: !isClerkConfigured,
  requiresAccount: false,
}

const AuthSessionContext = createContext<AuthSessionState>(anonymousBackendSession)

export function AuthSessionProvider({
  children,
  value,
}: {
  children: ReactNode
  value: AuthSessionState
}) {
  return createElement(AuthSessionContext.Provider, { value }, children)
}

export function useAuthSession() {
  return useContext(AuthSessionContext)
}
