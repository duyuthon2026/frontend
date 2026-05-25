import { lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { AccountRequiredCard } from '../features/auth/AuthSession'
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
  const backendAuthRequired = usePrototypeStore((state) => state.backendAuthRequired)
  const backendError = usePrototypeStore((state) => state.backendError)
  const backendStatus = usePrototypeStore((state) => state.backendStatus)

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
        {backendStatus === 'loading' && (
          <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] px-4 py-3 text-[0.78rem] font-bold text-[var(--color-content-muted)] shadow-[var(--shadow-glass)]">
            서버 냉장고 데이터를 불러오는 중입니다...
          </div>
        )}
        {backendAuthRequired && (
          <AccountRequiredCard
            forceVisible
            title="로그인 상태를 다시 확인하세요"
            actionLabel="서버 인증이 만료되었거나 로그인이 필요합니다."
          />
        )}
        {backendError && !backendAuthRequired && (
          <div className="rounded-2xl border border-[var(--color-error)]/30 bg-[var(--color-surface-danger-soft)]/25 px-4 py-3 text-[0.78rem] font-bold leading-relaxed text-[var(--color-error)] shadow-[var(--shadow-glass)]">
            서버 동기화 실패: {backendError}
          </div>
        )}
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
