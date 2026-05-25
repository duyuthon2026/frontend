import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/react'
import type { ReactNode } from 'react'
import { Icon } from '../../components/ui/Icons'
import { isClerkConfigured } from '../../lib/clerk'
import { cn } from '../../lib/cn'
import { useAuthSession } from './authSessionContext'

type AuthHeaderControlProps = {
  active: boolean
  onOpenProfile: () => void
}

type AuthProfileCardProps = {
  savedRecipesCount: number
  totalItemsCount: number
}

export function AuthHeaderControl({ active, onOpenProfile }: AuthHeaderControlProps) {
  const session = useAuthSession()

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
      {!session.isLoaded && (
        <span className="min-h-10 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] px-3 text-[0.76rem] font-extrabold leading-10 text-[var(--color-content-muted)] shadow-[var(--shadow-glass)]">
          확인 중
        </span>
      )}
      {session.isLoaded && !session.isSignedIn && (
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
      )}
      {session.isLoaded && session.isSignedIn && (
        <div className="grid h-10 w-10 place-items-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] shadow-[var(--shadow-glass)]">
          <UserButton />
        </div>
      )}
    </div>
  )
}

export function AuthProfileCard({ savedRecipesCount, totalItemsCount }: AuthProfileCardProps) {
  const session = useAuthSession()

  if (!isClerkConfigured) {
    return (
      <ProfileCardShell
        avatar={<Icon.User size={22} />}
        title="모바일 QA 냉장고"
        subtitle={`익명 서버 동기화 · 보관 ${totalItemsCount}개 · 저장 레시피 ${savedRecipesCount}개`}
      />
    )
  }

  if (!session.isLoaded) {
    return (
      <ProfileCardShell
        avatar={<Icon.User size={22} />}
        title="계정 상태 확인 중"
        subtitle="Clerk 세션과 서버 연결을 확인하고 있습니다."
      />
    )
  }

  if (!session.isSignedIn) {
    return <SignedOutProfileCard />
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
    <ProfileCardShell
      avatar={user?.imageUrl
        ? <img src={user.imageUrl} alt="" className="h-full w-full rounded-full object-cover" />
        : <Icon.User size={22} />}
      title={displayName}
      subtitle={subtitle}
      trailing={<UserButton />}
    />
  )
}

export function AuthBackendStatusCard() {
  const session = useAuthSession()
  const status = getBackendStatus(session)

  return (
    <div className="grid gap-2 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] p-4 shadow-[var(--shadow-glass)]">
      <div className="flex items-center gap-3">
        <div className={cn(
          'grid h-10 w-10 place-items-center rounded-xl',
          status.active
            ? 'bg-[var(--color-success-subtle)] text-[var(--color-success)]'
            : 'bg-[var(--color-surface-warning-soft)] text-[var(--color-warning)]',
        )}>
          {status.active ? <Icon.Check size={19} /> : <Icon.AlertTriangle size={19} />}
        </div>
        <div className="grid min-w-0 gap-0.5">
          <strong className="text-[0.86rem] font-extrabold text-[var(--color-content-default)]">
            {status.title}
          </strong>
          <span className="text-[0.74rem] font-bold text-[var(--color-content-muted)]">
            {status.description}
          </span>
        </div>
      </div>
    </div>
  )
}

function SignedOutProfileCard() {
  return (
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
            로그인하면 여러 기기에서 프로필, 식재료, 레시피, 푸시 구독을 같은 계정으로 이어갑니다.
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
  )
}

function getBackendStatus(session: {
  canUseBackendAccount: boolean
  isConfigured: boolean
  isLoaded: boolean
  isSignedIn: boolean
}) {
  if (!session.isLoaded) {
    return {
      active: false,
      description: '인증 상태를 확인한 뒤 서버 저장을 시작합니다.',
      title: '서버 연결 확인 중',
    }
  }

  if (session.canUseBackendAccount) {
    return {
      active: true,
      description: session.isConfigured
        ? '로그인 계정 기준으로 백엔드에 저장됩니다.'
        : 'Clerk 미설정 로컬/QA 모드에서 익명 서버 저장을 사용합니다.',
      title: '서버 동기화 활성',
    }
  }

  return {
    active: false,
    description: '가입 또는 로그인 전에는 저장/수정/삭제/푸시 구독을 막습니다.',
    title: '로그인 필요',
  }
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
