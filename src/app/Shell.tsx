import type { PropsWithChildren } from 'react'
import { AppLogo } from '../components/AppLogo'
import { appTabs, type AppTabId } from '../domain/prototype'
import { cn } from '../lib/cn'

type ShellProps = PropsWithChildren<{
  activeTab: AppTabId
  onTabChange: (tab: AppTabId) => void
}>

export function Shell({ activeTab, children, onTabChange }: ShellProps) {
  return (
    <div className="relative mx-auto min-h-svh w-full max-w-[520px] px-4 pb-[88px] text-[#272719] md:max-w-[980px] md:px-6">
      <header className="sticky top-0 z-10 flex min-h-[58px] items-center justify-between bg-[#FAFAF1]/90 py-1.5 backdrop-blur">
        <AppLogo />
        <button
          type="button"
          className="grid h-10 w-[52px] place-items-center rounded-full border border-[#E3E1C0] bg-white text-[0.78rem] font-extrabold text-[#272719]"
          aria-label="알림 설정"
        >
          알림
        </button>
      </header>
      {children}
      <nav
        className="fixed inset-x-4 bottom-3.5 z-20 mx-auto grid max-w-[488px] grid-cols-5 gap-1 rounded-lg border border-[#E2E0BD] bg-white/95 p-1.5 shadow-[0_16px_38px_rgba(80,78,18,0.16)] backdrop-blur md:max-w-[932px]"
        aria-label="주요 메뉴"
      >
        {appTabs.map((item) => (
          <button
            type="button"
            className={cn(
              'grid min-h-10 place-items-center rounded-md border-0 bg-transparent text-[0.82rem] font-extrabold text-[#68684C]',
              activeTab === item.id && 'bg-[#F4F8DF] text-[#272719]',
            )}
            key={item.id}
            onClick={() => onTabChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
