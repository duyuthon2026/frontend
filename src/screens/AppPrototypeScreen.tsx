import { motion, AnimatePresence } from 'framer-motion'
import { usePrototypeStore } from '../stores/usePrototypeStore'
import { HomeTab } from './tabs/HomeTab'
import { InventoryTab } from './tabs/InventoryTab'
import { LensTab } from './tabs/LensTab'
import { RecipesTab } from './tabs/RecipesTab'
import { MyTab } from './tabs/MyTab'

export function AppPrototypeScreen() {
  const activeTab = usePrototypeStore((state) => state.activeTab)

  return (
    <AnimatePresence mode="wait">
      <motion.main
        className="grid gap-5 pt-1"
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.24, ease: [0.25, 1, 0.5, 1] }}
      >
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'lens' && <LensTab />}
        {activeTab === 'recipes' && <RecipesTab />}
        {activeTab === 'my' && <MyTab />}
      </motion.main>
    </AnimatePresence>
  )
}
