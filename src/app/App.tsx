import { useEffect } from 'react'
import { Shell } from './Shell'
import { useAuthSession } from '../features/auth/authSessionContext'
import { addApiUnauthorizedListener } from '../lib/apiClient'
import { AppPrototypeScreen } from '../screens/AppPrototypeScreen'
import { usePrototypeStore } from '../stores/usePrototypeStore'

export function App() {
  const activeTab = usePrototypeStore((state) => state.activeTab)
  const loadBackendState = usePrototypeStore((state) => state.loadBackendState)
  const markBackendAuthRequired = usePrototypeStore((state) => state.markBackendAuthRequired)
  const resetBackendState = usePrototypeStore((state) => state.resetBackendState)
  const setActiveTab = usePrototypeStore((state) => state.setActiveTab)
  const { canUseBackendAccount, isLoaded } = useAuthSession()

  useEffect(() => {
    return addApiUnauthorizedListener(markBackendAuthRequired)
  }, [markBackendAuthRequired])

  useEffect(() => {
    if (!isLoaded) return
    if (!canUseBackendAccount) {
      resetBackendState()
      return
    }

    void loadBackendState()
  }, [canUseBackendAccount, isLoaded, loadBackendState, resetBackendState])

  return (
    <Shell activeTab={activeTab} onTabChange={setActiveTab}>
      <AppPrototypeScreen />
    </Shell>
  )
}
