import { useEffect, useState } from 'react'
import { Icon } from './Icons'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      )
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <button
      type="button"
      onClick={() => setIsDark(!isDark)}
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
