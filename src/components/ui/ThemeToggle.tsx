import { useEffect, useState } from 'react'
import { useAuthSession } from '../../features/auth/authSessionContext'
import { updateClientPreferences, type ClientThemePreference } from '../../lib/backendApi'
import { Icon } from './Icons'

export function ThemeToggle() {
  const { canUseBackendAccount } = useAuthSession()
  const [theme, setTheme] = useState<ClientThemePreference>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })
  const isDark = theme === 'dark'

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const handleToggle = () => {
    const nextTheme: ClientThemePreference = isDark ? 'light' : 'dark'
    setTheme(nextTheme)
    if (canUseBackendAccount) {
      void updateClientPreferences({ theme: nextTheme }).catch((error: unknown) => {
        if (import.meta.env.DEV) {
          console.warn('Theme preference sync failed:', error)
        }
      })
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="relative grid h-10 w-10 place-items-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] text-[var(--color-content-default)] shadow-[var(--shadow-glass)] transition-all hover:border-[var(--color-border-brand)] hover:scale-105 active:scale-95"
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <div className="relative h-5 w-5">
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
          }`}
        >
          <Icon.Moon size={18} className="text-[var(--color-tertiary)]" />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
            isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        >
          <Icon.Sun size={18} className="text-[var(--color-secondary)]" />
        </span>
      </div>
    </button>
  )
}
