import { SignInButton, SignUpButton } from '@clerk/react'
import { Icon } from '../../components/ui/Icons'
import { cn } from '../../lib/cn'
import { useAuthSession } from './authSessionContext'

export function AccountRequiredCard({
  actionLabel = '냉장고 데이터를 저장하려면 계정이 필요합니다.',
  className,
}: {
  actionLabel?: string
  className?: string
}) {
  const session = useAuthSession()

  if (!session.requiresAccount) return null

  return (
    <div
      className={cn(
        'grid gap-3 rounded-2xl border border-[var(--color-border-brand)] bg-gradient-to-r from-[var(--color-bg-overlay)] to-[var(--color-surface-brand-soft)]/35 p-4 shadow-[var(--shadow-glass)]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm">
          <Icon.User size={19} />
        </div>
        <div className="grid gap-1">
          <strong className="text-[0.92rem] font-extrabold text-[var(--color-content-default)]">
            가입하고 백엔드 냉장고에 저장하세요
          </strong>
          <p className="m-0 text-[0.76rem] font-semibold leading-relaxed text-[var(--color-content-muted)]">
            {actionLabel} 가입 또는 로그인 후 여러 기기에서 같은 식재료, 레시피, 알림 설정을 이어갈 수 있습니다.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SignUpButton mode="modal">
          <button
            type="button"
            className="min-h-10 rounded-xl border-0 bg-[var(--color-primary)] text-[0.8rem] font-extrabold text-[var(--color-on-primary)] shadow-sm"
          >
            가입하기
          </button>
        </SignUpButton>
        <SignInButton mode="modal">
          <button
            type="button"
            className="min-h-10 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] text-[0.8rem] font-extrabold text-[var(--color-content-default)] shadow-sm"
          >
            로그인
          </button>
        </SignInButton>
      </div>
    </div>
  )
}
