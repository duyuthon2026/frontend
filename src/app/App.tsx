import { useEffect } from 'react'
import { Shell } from './Shell'
import { useAuthSession } from '../features/auth/authSessionContext'
import { AppPrototypeScreen } from '../screens/AppPrototypeScreen'
import { usePrototypeStore } from '../stores/usePrototypeStore'

export function App() {
  const activeTab = usePrototypeStore((state) => state.activeTab)
  const loadBackendState = usePrototypeStore((state) => state.loadBackendState)
  const resetBackendState = usePrototypeStore((state) => state.resetBackendState)
  const setActiveTab = usePrototypeStore((state) => state.setActiveTab)
  const { canUseBackendAccount, isLoaded } = useAuthSession()

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
