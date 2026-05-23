import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/react'
import type { ReactNode } from 'react'
import { Icon } from '../../components/ui/Icons'
import { isClerkConfigured } from '../../lib/clerk'
import { cn } from '../../lib/cn'

type AuthHeaderControlProps = {
  active: boolean
  onOpenProfile: () => void
}

type AuthProfileCardProps = {
  savedRecipesCount: number
  totalItemsCount: number
}

export function AuthHeaderControl({ active, onOpenProfile }: AuthHeaderControlProps) {
  if (!isClerkConfigured) {
    return (
      <button
        type="button"
        onClick={onOpenProfile}
        className={cn(
          'relative grid h-10 w-10 place-items-center rounded-full border bg-[var(--color-bg-overlay)] text-[var(--color-content-default)] shadow-[var(--shadow-glass)] transition-all hover:scale-105 active:scale-95',
          active
            ? 'border-[var(--color-border-brand)] bg-[var(--color-surface-brand-soft)] text-[var(--color-content-brand)]'
            : 'border-[var(--color-border-default)] hover:border-[var(--color-border-brand)]',
        )}
        aria-label="프로필 및 설정"
        aria-current={active ? 'page' : undefined}
      >
        <Icon.User size={18} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onOpenProfile}
        className={cn(
          'relative grid h-10 w-10 place-items-center rounded-full border bg-[var(--color-bg-overlay)] text-[var(--color-content-default)] shadow-[var(--shadow-glass)] transition-all hover:scale-105 active:scale-95',
          active
            ? 'border-[var(--color-border-brand)] bg-[var(--color-surface-brand-soft)] text-[var(--color-content-brand)]'
            : 'border-[var(--color-border-default)] hover:border-[var(--color-border-brand)]',
        )}
        aria-label="프로필 및 설정"
        aria-current={active ? 'page' : undefined}
      >
        <Icon.User size={18} />
      </button>
      <Show when="signed-out">
        <div className="flex items-center gap-1.5">
          <SignInButton mode="modal">
            <button
              type="button"
              className="min-h-10 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] px-3 text-[0.76rem] font-extrabold text-[var(--color-content-default)] shadow-[var(--shadow-glass)] transition-all hover:scale-105 hover:border-[var(--color-border-brand)] active:scale-95"
            >
              로그인
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              type="button"
              className="hidden min-h-10 rounded-full border border-[var(--color-border-brand)] bg-[var(--color-surface-brand-soft)] px-3 text-[0.76rem] font-extrabold text-[var(--color-content-brand)] shadow-[var(--shadow-glass)] transition-all hover:scale-105 active:scale-95 md:inline-flex md:items-center"
            >
              가입
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <div className="grid h-10 w-10 place-items-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] shadow-[var(--shadow-glass)]">
          <UserButton />
        </div>
      </Show>
    </div>
  )
}

export function AuthProfileCard({ savedRecipesCount, totalItemsCount }: AuthProfileCardProps) {
  if (!isClerkConfigured) {
    return (
      <ProfileCardShell
        avatar={<Icon.User size={22} />}
        title="해커톤 팀 냉장고"
        subtitle={`2인 가구 기준 · 보관 ${totalItemsCount}개 · 저장 레시피 ${savedRecipesCount}개`}
      />
    )
  }

  return <ClerkProfileCard savedRecipesCount={savedRecipesCount} totalItemsCount={totalItemsCount} />
}

function ClerkProfileCard({ savedRecipesCount, totalItemsCount }: AuthProfileCardProps) {
  const { isLoaded, user } = useUser()
  const displayName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Clerk 사용자'
  const subtitle = isLoaded && user
    ? `보관 ${totalItemsCount}개 · 저장 레시피 ${savedRecipesCount}개`
    : '계정 정보를 불러오는 중입니다.'

  return (
    <>
      <Show when="signed-out">
        <div className="grid gap-3 rounded-2xl border border-[var(--color-border-brand)] bg-gradient-to-r from-[var(--color-bg-overlay)] to-[var(--color-surface-brand-soft)]/30 p-4 shadow-[var(--shadow-glass)]">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm">
              <Icon.User size={22} />
            </div>
            <div className="grid flex-1 gap-1">
              <strong className="text-[0.96rem] font-extrabold text-[var(--color-content-default)]">
                계정을 만들고 냉장고를 연결하세요
              </strong>
              <span className="text-[0.76rem] font-bold leading-relaxed text-[var(--color-content-muted)]">
                로그인하면 여러 기기에서 프로필과 식재료 데이터를 안전하게 이어갈 수 있습니다.
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SignInButton mode="modal">
              <button
                type="button"
                className="min-h-11 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] text-[0.82rem] font-extrabold text-[var(--color-content-default)] shadow-sm"
              >
                로그인
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="min-h-11 rounded-xl border-0 bg-[var(--color-primary)] text-[0.82rem] font-extrabold text-[var(--color-on-primary)] shadow-sm"
              >
                가입하기
              </button>
            </SignUpButton>
          </div>
        </div>
      </Show>
      <Show when="signed-in">
        <ProfileCardShell
          avatar={user?.imageUrl
            ? <img src={user.imageUrl} alt="" className="h-full w-full rounded-full object-cover" />
            : <Icon.User size={22} />}
          title={displayName}
          subtitle={subtitle}
          trailing={<UserButton />}
        />
      </Show>
    </>
  )
}

function ProfileCardShell({
  avatar,
  subtitle,
  title,
  trailing,
}: {
  avatar: ReactNode
  subtitle: string
  title: string
  trailing?: ReactNode
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] p-4 shadow-[var(--shadow-glass)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm">
        {avatar}
      </div>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <strong className="truncate text-[0.96rem] font-extrabold text-[var(--color-content-default)]">
          {title}
        </strong>
        <span className="text-[0.76rem] font-bold text-[var(--color-content-muted)]">
          {subtitle}
        </span>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )
}
