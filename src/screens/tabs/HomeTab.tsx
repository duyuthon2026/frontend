import { MetricCard } from '../../components/ui/MetricCard'
import { Panel } from '../../components/ui/Panel'
import { Icon } from '../../components/ui/Icons'
import { type HomeState, type HomeStateId, calculateDaysLeft, type InventoryItem } from '../../domain/prototype'
import { formatLocalDate } from '../../lib/date'
import { cn } from '../../lib/cn'
import { usePrototypeStore } from '../../stores/usePrototypeStore'

export function HomeTab() {
  const items = usePrototypeStore((state) => state.items)
  const setActiveTab = usePrototypeStore((state) => state.setActiveTab)

  const overdueCount = items.filter((i) => calculateDaysLeft(i.expiresAt) < 0).length
  const soonCount = items.filter((i) => {
    const dl = calculateDaysLeft(i.expiresAt)
    return dl >= 0 && dl <= 2
  }).length
  const totalCount = items.length
  const fridgeCount = items.filter((i) => i.location === '냉장').length
  const freezerCount = items.filter((i) => i.location === '냉동').length

  let currentTone: HomeStateId = 'default'
  let visualTone: 'ready' | 'empty' | 'warning' | 'danger' = 'ready'
  let stateLabel = '안정'
  let stateTitle = '보관 중인 식재료가 모두 안전합니다'
  let stateDesc = '식재료 낭비 제로! 오늘 어울리는 레시피를 확인해보세요.'

  if (totalCount === 0) {
    currentTone = 'empty'
    visualTone = 'empty'
    stateLabel = '비어 있음'
    stateTitle = '냉장고가 비어 있습니다'
    stateDesc = 'AI 렌즈로 영수증이나 냉장고 내부를 촬영하여 식재료를 채워보세요.'
  } else if (overdueCount > 0) {
    currentTone = 'overdue'
    visualTone = 'danger'
    stateLabel = '확인 필요'
    stateTitle = `기한 초과 재료 ${overdueCount}개 감지!`
    stateDesc = '상태를 신속하게 확인하고 폐기 여부를 결정하거나 즉시 소진해보세요.'
  } else if (soonCount > 0) {
    currentTone = 'expiring'
    visualTone = 'warning'
    stateLabel = '임박 알림'
    stateTitle = `소비기한 임박 재료 ${soonCount}개`
    stateDesc = '오늘 또는 내일 내에 사용할 재료들이 있습니다. 추천 레시피로 소진해보세요.'
  }

  const priorityCount = soonCount + overdueCount

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const startDayOfWeek = firstDayOfMonth.getDay()
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const prevMonthDays = []
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const totalDaysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate()

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(new Date(prevMonthYear, prevMonth, totalDaysInPrevMonth - i))
  }

  const currentMonthDays = []
  for (let i = 1; i <= totalDaysInMonth; i++) {
    currentMonthDays.push(new Date(currentYear, currentMonth, i))
  }

  const nextMonthDays = []
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
  const totalGridCells = prevMonthDays.length + currentMonthDays.length
  const remainingCells = totalGridCells % 7 === 0 ? 0 : 7 - (totalGridCells % 7)

  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDays.push(new Date(nextMonthYear, nextMonth, i))
  }

  const allCalendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]

  const getItemsExpiringOnDate = (date: Date) => {
    const dateStr = formatLocalDate(date)
    return items.filter((item) => item.expiresAt === dateStr)
  }

  const getDayTone = (expiringItems: InventoryItem[]) => {
    if (expiringItems.length === 0) return 'none'
    const hasOverdue = expiringItems.some((item) => calculateDaysLeft(item.expiresAt) < 0)
    const hasSoon = expiringItems.some((item) => {
      const dl = calculateDaysLeft(item.expiresAt)
      return dl >= 0 && dl <= 2
    })
    if (hasOverdue) return 'danger'
    if (hasSoon) return 'soon'
    return 'safe'
  }

  return (
    <div className="grid gap-5">
      <ScreenHero
        eyebrow="오늘의 현황"
        title="식탁 위의 잔반을 제로로"
        description="인벤토리 보관 상태와 소비기한 임박 식재료를 한눈에 관리하는 홈 스크린"
        actionLabel="렌즈 촬영"
        onAction={() => setActiveTab('lens')}
      />

      <HomeStateCard
        state={{
          id: currentTone,
          label: stateLabel,
          title: stateTitle,
          description: stateDesc,
          tone: visualTone,
        }}
      />

      <section className="grid grid-cols-3 gap-3 my-0.5" aria-label="홈 지표">
        <MetricCard
          label="보관 재료"
          value={`${totalCount}개`}
          helper={`냉장 ${fridgeCount} · 냉동 ${freezerCount}`}
          tone="normal"
        />
        <MetricCard
          label="임박 식재료"
          value={`${soonCount}개`}
          helper={`오늘 ${items.filter((i) => calculateDaysLeft(i.expiresAt) === 0).length}개`}
          tone={soonCount > 0 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="우선 소진"
          value={`${priorityCount}개`}
          helper={overdueCount > 0 ? `기한초과 ${overdueCount}개` : '오늘 확인 필요'}
          tone={priorityCount > 0 ? 'warning' : 'ready'}
        />
      </section>

      <Panel eyebrow="Calendar" title={`${currentMonth + 1}월 소비기한 캘린더`} description="보관 중인 식재료의 소비기한 분포를 달력에서 한눈에 확인하세요.">
        <div className="grid gap-2">
          <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem] font-black text-[var(--color-content-muted)] uppercase">
            <span>일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span>토</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {allCalendarDays.map((date, idx) => {
              const isCurrentMonth = date.getMonth() === currentMonth
              const expiringItems = getItemsExpiringOnDate(date)
              const tone = getDayTone(expiringItems)
              const isToday = formatLocalDate(date) === formatLocalDate(today)

              return (
                <div
                  key={idx}
                  className={cn(
                    'relative flex flex-col items-center justify-between min-h-[56px] p-1 rounded-lg border transition-all duration-300',
                    !isCurrentMonth && 'opacity-30',
                    isToday
                      ? 'border-[var(--color-primary)] bg-[var(--color-surface-brand-soft)]'
                      : 'border-[var(--color-border-default)] bg-[var(--color-bg-base)]',
                    tone === 'danger' && 'border-[var(--color-error)]/40 bg-[var(--color-surface-danger-soft)]/20',
                    tone === 'soon' && 'border-[var(--color-border-brand)]/40 bg-[var(--color-surface-warning-soft)]/20'
                  )}
                >
                  <span className={cn(
                    'text-[0.64rem] font-bold',
                    isToday ? 'text-[var(--color-primary)] font-black' : 'text-[var(--color-content-muted)]'
                  )}>
                    {date.getDate()}
                  </span>
                  {expiringItems.length > 0 && (
                    <div className="flex flex-col items-center gap-0.5 w-full">
                      <span className={cn(
                        'text-[0.68rem] font-black px-1 rounded',
                        tone === 'danger' && 'bg-[var(--color-error)] text-[var(--color-on-secondary)]',
                        tone === 'soon' && 'bg-[var(--color-primary)] text-[var(--color-on-primary)]',
                        tone === 'safe' && 'bg-[var(--color-success)] text-[var(--color-on-secondary)]'
                      )}>
                        {expiringItems.length}
                      </span>
                      <span className="text-[0.5rem] font-bold text-[var(--color-content-muted)] truncate max-w-full px-0.5">
                        {expiringItems[0].name}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </Panel>
    </div>
  )
}

type ScreenHeroProps = {
  actionLabel?: string
  description: string
  eyebrow: string
  onAction?: () => void
  title: string
}

function ScreenHero({ actionLabel, description, eyebrow, onAction, title }: ScreenHeroProps) {
  return (
    <section className="relative overflow-hidden flex flex-col gap-1.5 pt-3 pb-1 md:flex-row md:items-end md:justify-between md:gap-6">
      <div className="grid gap-1">
        <p className="m-0 text-[0.68rem] font-black uppercase tracking-widest text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
          {eyebrow}
        </p>
        <h1 className="m-0 text-[1.8rem] leading-none font-extrabold tracking-tight text-[var(--color-content-default)]">
          {title}
        </h1>
        <p className="m-0 text-[0.84rem] leading-[1.4] text-[var(--color-content-muted)] max-w-sm">
          {description}
        </p>
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 md:mt-0 flex items-center justify-center gap-2 min-h-11 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-[var(--color-on-primary)] hover:text-[var(--color-on-secondary)] font-extrabold text-[0.85rem] shadow-[var(--shadow-glass)] transition-all duration-300 active:scale-95 border-0"
        >
          <Icon.Camera size={14} />
          {actionLabel}
        </button>
      )}
    </section>
  )
}

function HomeStateCard({ state }: { state: HomeState }) {
  const isDanger = state.tone === 'danger'
  const isWarning = state.tone === 'warning'
  const isEmpty = state.tone === 'empty'

  return (
    <article
      className={cn(
        'relative overflow-hidden flex flex-col gap-1.5 rounded-2xl border p-4.5 transition-all duration-300 shadow-[var(--shadow-glass)]',
        isDanger
          ? 'border-[var(--color-error)]/30 bg-[var(--color-bg-overlay)] border-l-4 border-l-[var(--color-error)]'
          : isWarning
            ? 'border-[var(--color-border-brand)] bg-[var(--color-bg-overlay)] border-l-4 border-l-[var(--color-warning)]'
            : isEmpty
              ? 'border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-base)]'
              : 'border-[var(--color-border-brand)] bg-[var(--color-bg-overlay)] border-l-4 border-l-[var(--color-success)]'
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-[0.62rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border',
            isDanger
              ? 'border-[var(--color-error)]/30 bg-[var(--color-error)]/10 text-[var(--color-error)]'
              : isWarning
                ? 'border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                : isEmpty
                  ? 'border-[var(--color-border-strong)]/30 text-[var(--color-content-muted)]'
                  : 'border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]'
          )}
        >
          {state.label}
        </span>
        <span className="text-[0.72rem] font-bold text-[var(--color-content-muted)]">
          현재 냉장고 상태
        </span>
      </div>
      <strong className="text-[1.05rem] font-extrabold text-[var(--color-content-default)]">
        {state.title}
      </strong>
      <p className="m-0 text-[0.8rem] leading-[1.4] text-[var(--color-content-muted)] max-w-[90%]">
        {state.description}
      </p>

      <div className="absolute right-4 bottom-4 opacity-[0.05] dark:opacity-[0.1]">
        <Icon.Sparkles size={48} className="text-[var(--color-primary)]" />
      </div>
    </article>
  )
}
