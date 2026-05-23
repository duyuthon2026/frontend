import { Icon } from '../../components/ui/Icons'
import { mySettingGroups } from '../../domain/prototype'
import { AuthProfileCard } from '../../features/auth/AuthControls'
import { CameraReadinessCard } from '../../features/camera/CameraReadinessCard'
import { NotificationSetupCard } from '../../features/notifications/NotificationSetupCard'
import { usePrototypeStore } from '../../stores/usePrototypeStore'
import { usePWAInstall } from '../../lib/pwa'

export function MyTab() {
  const items = usePrototypeStore((state) => state.items)
  const recipes = usePrototypeStore((state) => state.recipes)

  const savedRecipesCount = recipes.filter((r) => r.saved).length
  const totalItemsCount = items.length

  const { isInstallable, isStandalone, isIOS, installApp } = usePWAInstall()

  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden grid gap-1 pt-3 pb-1">
        <p className="m-0 text-[0.68rem] font-black uppercase tracking-widest text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
          마이페이지
        </p>
        <h1 className="m-0 text-[1.8rem] leading-none font-extrabold tracking-tight text-[var(--color-content-default)]">
          프로필 및 설정
        </h1>
        <p className="m-0 text-[0.82rem] text-[var(--color-content-muted)]">
          개인 식생활 설정과 냉장고 데이터를 확인하세요.
        </p>
      </section>

      <AuthProfileCard savedRecipesCount={savedRecipesCount} totalItemsCount={totalItemsCount} />

      {(!isStandalone && (isInstallable || isIOS)) && (
        <div className="grid gap-2.5 rounded-2xl border border-[var(--color-border-brand)] bg-gradient-to-r from-[var(--color-bg-overlay)] to-[var(--color-surface-brand-soft)]/30 p-4.5 shadow-[var(--shadow-glass)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm">
              <Icon.Sparkles size={20} />
            </div>
            <div className="grid gap-0.5 flex-1">
              <strong className="text-[0.92rem] font-extrabold text-[var(--color-content-default)]">
                홈 화면에 앱 추가하기
              </strong>
              <p className="m-0 text-[0.78rem] text-[var(--color-content-muted)] leading-relaxed">
                {isIOS
                  ? "Safari 브라우저 하단의 공유 버튼을 누르고 '홈 화면에 추가'를 선택하면 오프라인에서도 빠르게 실행할 수 있습니다."
                  : "앱을 홈 화면에 설치하여 더 넓은 화면과 푸시 알림 등 완벽한 앱 경험을 누려보세요."}
              </p>
            </div>
          </div>
          {isInstallable && (
            <button
              type="button"
              onClick={() => void installApp()}
              className="min-h-10 w-full rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-extrabold text-[0.8rem] shadow-sm border-0 cursor-pointer mt-1"
            >
              앱 설치하기
            </button>
          )}
        </div>
      )}

      <CameraReadinessCard />

      <NotificationSetupCard />

      <div className="grid gap-4">
        {mySettingGroups.map((group) => (
          <div key={group.title} className="grid gap-1">
            <span className="px-1.5 text-[0.66rem] font-black uppercase tracking-wider text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
              {group.title}
            </span>
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] divide-y divide-[var(--color-border-default)] shadow-[var(--shadow-glass)]">
              {group.items.map((item) => (
                <button
                  type="button"
                  key={item}
                  disabled
                  className="flex min-h-[46px] w-full cursor-not-allowed items-center justify-between border-0 bg-transparent px-4 text-left font-bold text-[var(--color-content-default)] opacity-75 transition-colors"
                >
                  <span className="text-[0.82rem] font-semibold">{item}</span>
                  <div className="flex items-center gap-1 text-[0.72rem] font-bold text-[var(--color-content-muted)]">
                    <span>준비중</span>
                    <Icon.ChevronRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
