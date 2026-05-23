import { useEffect } from 'react'
import { Shell } from './Shell'
import { AppPrototypeScreen } from '../screens/AppPrototypeScreen'
import { usePrototypeStore } from '../stores/usePrototypeStore'

export function App() {
  const activeTab = usePrototypeStore((state) => state.activeTab)
  const loadBackendState = usePrototypeStore((state) => state.loadBackendState)
  const setActiveTab = usePrototypeStore((state) => state.setActiveTab)

  useEffect(() => {
    void loadBackendState()
  }, [loadBackendState])

  return (
    <Shell activeTab={activeTab} onTabChange={setActiveTab}>
      <AppPrototypeScreen />
    </Shell>
  )
}
