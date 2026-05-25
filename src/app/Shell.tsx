import type { PropsWithChildren } from 'react'
import { motion } from 'framer-motion'
import { AppLogo } from '../components/AppLogo'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { Icon } from '../components/ui/Icons'
import { appTabs, type AppTabId } from '../domain/prototype'
import { AuthHeaderControl } from '../features/auth/AuthControls'
import { cn } from '../lib/cn'
import { usePWAInstall } from '../lib/pwa'

type ShellProps = PropsWithChildren<{
  activeTab: AppTabId
  onTabChange: (tab: AppTabId) => void
}>

export function Shell({ activeTab, children, onTabChange }: ShellProps) {
  const { installApp, isIOS, isInstallable, isStandalone } = usePWAInstall()
  const showInstallAction = !isStandalone && (isInstallable || isIOS)

  return (
    <div className="app-shell relative mx-auto flex w-full max-w-[520px] flex-col px-4 pt-[env(safe-area-inset-top,0px)] text-[var(--color-content-default)] md:max-w-[980px] md:px-6">
      <header className="z-30 flex min-h-[64px] shrink-0 items-center justify-between bg-[var(--color-bg-app)]/88 py-2 backdrop-blur-md transition-all">
        <AppLogo />
        <div className="flex items-center gap-2">
          {showInstallAction && (
            <button
              type="button"
              onClick={() => {
                if (isInstallable) {
                  void installApp()
                  return
                }

                onTabChange('my')
              }}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-[var(--color-border-brand)] bg-[var(--color-surface-brand-soft)] text-[var(--color-content-brand)] shadow-[var(--shadow-glass)] transition-all hover:scale-105 active:scale-95"
              aria-label={isInstallable ? 'PWA 앱 설치' : 'PWA 설치 안내'}
            >
              <Icon.Sparkles size={18} />
            </button>
          )}
          <ThemeToggle />
          <AuthHeaderControl active={activeTab === 'my'} onOpenProfile={() => onTabChange('my')} />
        </div>
      </header>

      <div className="app-scroll-container min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 pt-1">
        {children}
      </div>

      <nav
        className="z-40 mx-auto mb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] mt-2 flex w-full max-w-[480px] shrink-0 items-center justify-around rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)]/90 p-1.5 shadow-[var(--shadow-premium)] backdrop-blur-md transition-all md:max-w-[900px]"
        aria-label="주요 메뉴"
      >
        {appTabs.map((item) => {
          const isActive = activeTab === item.id

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative z-10 flex min-h-[46px] flex-1 flex-col items-center justify-center rounded-xl border-0 bg-transparent py-1 text-[0.7rem] font-extrabold tracking-tight transition-all duration-300',
                isActive
                  ? 'text-[var(--color-content-brand)]'
                  : 'text-[var(--color-content-muted)] hover:text-[var(--color-content-default)]'
              )}
            >
              {/* Bouncy background pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTabBgPill"
                  className="absolute inset-0 -z-10 rounded-xl bg-[var(--color-surface-brand-soft)] shadow-[0_4px_12px_rgba(189,187,64,0.12)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}

              <span className="mb-0.5 transition-transform duration-300 group-hover:scale-110">
                {item.id === 'home' && <Icon.Home size={18} />}
                {item.id === 'inventory' && <Icon.Inventory size={18} />}
                {item.id === 'lens' && <Icon.Camera size={18} />}
                {item.id === 'recipes' && <Icon.Recipes size={18} />}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
