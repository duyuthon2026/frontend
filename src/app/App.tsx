import { Shell } from './Shell'
import { AppPrototypeScreen } from '../screens/AppPrototypeScreen'
import { usePrototypeStore } from '../stores/usePrototypeStore'

export function App() {
  const activeTab = usePrototypeStore((state) => state.activeTab)
  const setActiveTab = usePrototypeStore((state) => state.setActiveTab)

  return (
    <Shell activeTab={activeTab} onTabChange={setActiveTab}>
      <AppPrototypeScreen />
    </Shell>
  )
}
