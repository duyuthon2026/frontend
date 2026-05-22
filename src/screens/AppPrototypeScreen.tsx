import { lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { usePrototypeStore } from '../stores/usePrototypeStore'

const HomeTab = lazy(() => import('./tabs/HomeTab').then((module) => ({ default: module.HomeTab })))
const InventoryTab = lazy(() => import('./tabs/InventoryTab').then((module) => ({ default: module.InventoryTab })))
const LensTab = lazy(() => import('./tabs/LensTab').then((module) => ({ default: module.LensTab })))
const RecipesTab = lazy(() => import('./tabs/RecipesTab').then((module) => ({ default: module.RecipesTab })))
const MyTab = lazy(() => import('./tabs/MyTab').then((module) => ({ default: module.MyTab })))

function ScreenFallback() {
  return (
    <div className="grid min-h-[260px] place-items-center rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] text-[0.82rem] font-extrabold text-[var(--color-content-muted)] shadow-[var(--shadow-glass)]">
      화면을 준비하고 있어요...
    </div>
  )
}

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
        <ErrorBoundary key={activeTab} fallbackTitle="탭 화면을 불러오지 못했습니다">
          <Suspense fallback={<ScreenFallback />}>
            {activeTab === 'home' && <HomeTab />}
            {activeTab === 'inventory' && <InventoryTab />}
            {activeTab === 'lens' && <LensTab />}
            {activeTab === 'recipes' && <RecipesTab />}
            {activeTab === 'my' && <MyTab />}
          </Suspense>
        </ErrorBoundary>
      </motion.main>
    </AnimatePresence>
  )
}
