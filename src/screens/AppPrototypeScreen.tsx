import { motion } from 'framer-motion'
import { AppLogo } from '../components/AppLogo'
import { Panel } from '../components/ui/Panel'
import {
  calendarPreview,
  homeStates,
  inventoryItems,
  inventoryViews,
  lensSteps,
  mySettingGroups,
  onboardingScreens,
  recipeCards,
  recipeViews,
  type HomeState,
  type InventoryViewId,
  type LensStepId,
  type PrototypeScreen,
  type RecipeViewId,
} from '../domain/prototype'
import { cn } from '../lib/cn'
import { usePrototypeStore } from '../stores/usePrototypeStore'

const eyebrowClass =
  'm-0 text-[0.76rem] font-extrabold uppercase tracking-normal text-[#7B7A22]'
const primaryActionClass =
  'min-h-12 rounded-lg border border-[#BDBB40] bg-[#BDBB40] px-3.5 text-[0.94rem] font-extrabold text-[#272719] disabled:cursor-not-allowed disabled:opacity-50'
const secondaryActionClass =
  'min-h-12 rounded-lg border border-[#D8D67A] bg-white px-3.5 text-[0.94rem] font-extrabold text-[#272719] disabled:cursor-not-allowed disabled:opacity-50'
const pillButtonClass =
  'min-h-[38px] rounded-full border border-[#E2E0BD] bg-white px-3.5 text-[0.84rem] font-extrabold text-[#68684C]'
const activePillClass = 'border-[#BDBB40] bg-[#F4F8DF] text-[#272719]'
const softCardClass = 'grid gap-2 rounded-lg border border-[#EEECCC] bg-[#FAFAF1] p-3.5'
const listStackClass = 'grid gap-2'

export function AppPrototypeScreen() {
  const activeTab = usePrototypeStore((state) => state.activeTab)

  return (
    <motion.main
      className="grid gap-3.5"
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {activeTab === 'home' && <HomeTab />}
      {activeTab === 'inventory' && <InventoryTab />}
      {activeTab === 'lens' && <LensTab />}
      {activeTab === 'recipes' && <RecipesTab />}
      {activeTab === 'my' && <MyTab />}
    </motion.main>
  )
}

function HomeTab() {
  const activeHomeState = usePrototypeStore((state) => state.activeHomeState)
  const setActiveHomeState = usePrototypeStore((state) => state.setActiveHomeState)
  const setActiveTab = usePrototypeStore((state) => state.setActiveTab)
  const current = homeStates.find((state) => state.id === activeHomeState) ?? homeStates[0]

  return (
    <>
      <ScreenHero
        eyebrow="Home"
        title="오늘 남기지 않기"
        description="인벤토리 상태, 임박 재료, 캘린더를 한 화면에서 확인하는 기본 홈"
        actionLabel="렌즈 열기"
        onAction={() => setActiveTab('lens')}
      />

      <section
        className="-mx-4 grid auto-cols-max grid-flow-col gap-2 overflow-x-auto px-4 pb-0.5"
        aria-label="홈 상태 프레임"
      >
        {homeStates.map((state) => (
          <StateButton
            active={activeHomeState === state.id}
            key={state.id}
            label={state.label}
            onClick={() => setActiveHomeState(state.id)}
          />
        ))}
      </section>

      <HomeStateCard state={current} />

      <section className="my-2 grid grid-cols-3 gap-2" aria-label="홈 지표">
        <MetricCard label="보관 재료" value="18개" helper="냉장 11개" />
        <MetricCard label="임박" value="4개" helper="오늘 2개" tone="warning" />
        <MetricCard label="절감" value="1.8kg" helper="이번 주" tone="ready" />
      </section>

      <Panel
        eyebrow="Onboarding"
        title="첫 진입 플로우"
        description={<p>스플래시부터 권한/취향 설정까지 해커톤 MVP 기준으로 짧게 구성</p>}
      >
        <div className="-mx-4 grid auto-cols-[minmax(166px,1fr)] grid-flow-col gap-2.5 overflow-x-auto px-4 pb-0.5">
          {onboardingScreens.map((screen) => (
            <PrototypeFrame screen={screen} key={screen.id} />
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Calendar" title="캘린더는 홈 안에 배치">
        <div className="grid grid-cols-5 gap-2">
          {calendarPreview.map((day) => (
            <div
              className={cn(
                'grid min-h-[68px] place-items-center rounded-lg border border-[#EEECCC] text-[#272719]',
                toneBackground(day.tone),
              )}
              key={day.day}
            >
              <strong>{day.day}</strong>
              <span className="text-[0.76rem] text-[#68684C]">{day.count}개</span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  )
}

function InventoryTab() {
  const activeInventoryView = usePrototypeStore((state) => state.activeInventoryView)
  const setActiveInventoryView = usePrototypeStore((state) => state.setActiveInventoryView)
  const current =
    inventoryViews.find((view) => view.id === activeInventoryView) ?? inventoryViews[0]

  return (
    <>
      <ScreenHero
        eyebrow="Inventory"
        title="식재료를 독립 탭으로 관리"
        description="리스트, 필터, 상세, 추가/수정, 폐기 확인까지 인벤토리 핵심 화면을 분리"
      />
      <SegmentedControl
        activeId={activeInventoryView}
        items={inventoryViews}
        onChange={(id) => setActiveInventoryView(id as InventoryViewId)}
      />
      <Panel eyebrow={current.label} title={current.title} description={<p>{current.description}</p>}>
        {activeInventoryView === 'filter' && <FilterPanel />}
        {activeInventoryView === 'detail' && <IngredientDetail />}
        {activeInventoryView === 'add' && <IngredientForm mode="add" />}
        {activeInventoryView === 'edit' && <IngredientForm mode="edit" />}
        {activeInventoryView === 'delete' && <DeleteConfirm />}
        {(activeInventoryView === 'list' || activeInventoryView === 'filter') && <InventoryList />}
      </Panel>
    </>
  )
}

function LensTab() {
  const activeLensStep = usePrototypeStore((state) => state.activeLensStep)
  const setActiveLensStep = usePrototypeStore((state) => state.setActiveLensStep)
  const currentIndex = lensSteps.findIndex((step) => step.id === activeLensStep)
  const current = lensSteps[currentIndex] ?? lensSteps[0]
  const previous = lensSteps[Math.max(0, currentIndex - 1)]
  const next = lensSteps[Math.min(lensSteps.length - 1, currentIndex + 1)]

  return (
    <>
      <ScreenHero
        eyebrow="Lens"
        title="촬영에서 등록 완료까지"
        description="앱의 핵심 플로우를 7개 화면으로 나누고, 한 탭 안에서 순서대로 확인"
      />
      <SegmentedControl
        activeId={activeLensStep}
        items={lensSteps}
        onChange={(id) => setActiveLensStep(id as LensStepId)}
      />
      <Panel eyebrow={current.label} title={current.title} description={<p>{current.description}</p>}>
        <LensMock step={activeLensStep} />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={secondaryActionClass}
            disabled={currentIndex === 0}
            onClick={() => setActiveLensStep(previous.id as LensStepId)}
          >
            이전
          </button>
          <button
            type="button"
            className={primaryActionClass}
            disabled={currentIndex === lensSteps.length - 1}
            onClick={() => setActiveLensStep(next.id as LensStepId)}
          >
            다음
          </button>
        </div>
      </Panel>
    </>
  )
}

function RecipesTab() {
  const activeRecipeView = usePrototypeStore((state) => state.activeRecipeView)
  const setActiveRecipeView = usePrototypeStore((state) => state.setActiveRecipeView)
  const current = recipeViews.find((view) => view.id === activeRecipeView) ?? recipeViews[0]

  return (
    <>
      <ScreenHero
        eyebrow="Recipes"
        title="남기기 전 소진 메뉴 추천"
        description="검색, 조건 선택, 상세, 저장, 요리 완료 차감까지 레시피 흐름 구성"
      />
      <SegmentedControl
        activeId={activeRecipeView}
        items={recipeViews}
        onChange={(id) => setActiveRecipeView(id as RecipeViewId)}
      />
      <Panel eyebrow={current.label} title={current.title} description={<p>{current.description}</p>}>
        {activeRecipeView === 'conditions' && <RecipeConditions />}
        {activeRecipeView === 'detail' && <RecipeDetail />}
        {activeRecipeView === 'complete' && <RecipeComplete />}
        {activeRecipeView !== 'detail' && activeRecipeView !== 'complete' && (
          <RecipeList savedOnly={activeRecipeView === 'saved'} />
        )}
      </Panel>
    </>
  )
}

function MyTab() {
  return (
    <>
      <ScreenHero
        eyebrow="My"
        title="설정은 짧고 기능 중심"
        description="프로필, 알림, 식습관, 앱 정보를 최소 화면으로 묶은 마이 탭"
      />
      <Panel eyebrow="Profile" title="나의 냉장고">
        <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-lg border border-[#EEECCC] bg-[#FAFAF1] p-3.5">
          <AppLogo imageClassName="h-auto w-[92px] object-contain" />
          <div className="grid gap-1">
            <strong className="text-[#272719]">해커톤 팀 냉장고</strong>
            <span className="text-[0.86rem] leading-[1.42] text-[#68684C]">
              기본 위치 냉장, 2인 기준 추천
            </span>
          </div>
        </div>
      </Panel>
      <div className="grid gap-3">
        {mySettingGroups.map((group) => (
          <Panel eyebrow="Settings" title={group.title} key={group.title}>
            <div className={listStackClass}>
              {group.items.map((item) => (
                <button
                  type="button"
                  className="flex min-h-12 items-center justify-between rounded-lg border border-[#EEECCC] bg-[#FAFAF1] px-3 text-left font-extrabold text-[#272719]"
                  key={item}
                >
                  <span>{item}</span>
                  <strong className="text-[0.8rem] text-[#9F9F30]">관리</strong>
                </button>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </>
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
    <section className="grid gap-3.5 pt-6 pb-1 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
      <div className="grid gap-2.5">
        <p className={eyebrowClass}>{eyebrow}</p>
        <h1 className="m-0 max-w-[12ch] text-[2.35rem] leading-[1.04] font-extrabold tracking-normal text-[#272719] md:max-w-[17ch]">
          {title}
        </h1>
        <p className="m-0 leading-[1.45] text-[#68684C]">{description}</p>
      </div>
      {actionLabel && (
        <button type="button" className={primaryActionClass} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </section>
  )
}

type StateButtonProps = {
  active: boolean
  label: string
  onClick: () => void
}

function StateButton({ active, label, onClick }: StateButtonProps) {
  return (
    <button
      type="button"
      className={cn(pillButtonClass, active && activePillClass)}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function HomeStateCard({ state }: { state: HomeState }) {
  return (
    <article
      className={cn(
        'grid gap-2 rounded-lg border border-[#E2E0BD] p-4',
        toneBackground(state.tone),
      )}
    >
      <span className="text-[0.78rem] font-black text-[#7B7A22]">{state.label}</span>
      <strong className="text-[1.18rem] text-[#272719]">{state.title}</strong>
      <p className="m-0 leading-[1.45] text-[#68684C]">{state.description}</p>
    </article>
  )
}

type MetricCardProps = {
  helper: string
  label: string
  tone?: 'ready' | 'warning'
  value: string
}

function MetricCard({ helper, label, tone = 'ready', value }: MetricCardProps) {
  return (
    <article
      className={cn(
        'grid min-h-[78px] gap-1.5 rounded-lg border border-[#E2E0BD] p-3',
        tone === 'warning' ? 'bg-[#FBF4D6]' : 'bg-[#F4F8DF]',
      )}
    >
      <span className="text-[0.75rem] text-[#737356]">{label}</span>
      <strong className="text-[1.2rem] text-[#272719]">{value}</strong>
      <small className="text-[0.72rem] text-[#737356]">{helper}</small>
    </article>
  )
}

type SegmentedControlProps = {
  activeId: string
  items: PrototypeScreen[]
  onChange: (id: string) => void
}

function SegmentedControl({ activeId, items, onChange }: SegmentedControlProps) {
  return (
    <section
      className="-mx-4 grid auto-cols-max grid-flow-col gap-2 overflow-x-auto px-4 pb-0.5"
      aria-label="화면 선택"
    >
      {items.map((item) => (
        <button
          type="button"
          className={cn(pillButtonClass, activeId === item.id && activePillClass)}
          key={item.id}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </section>
  )
}

function PrototypeFrame({ screen }: { screen: PrototypeScreen }) {
  return (
    <article className={softCardClass}>
      <span className="text-[0.74rem] font-black text-[#9F9F30]">{screen.label}</span>
      <strong className="text-[#272719]">{screen.title}</strong>
      <p className="m-0 text-[0.86rem] leading-[1.42] text-[#68684C]">
        {screen.description}
      </p>
      {screen.meta && (
        <em className="w-fit rounded-full bg-[#F4F8DF] px-2 py-1 text-[0.72rem] font-black not-italic text-[#272719]">
          {screen.meta}
        </em>
      )}
    </article>
  )
}

function InventoryList() {
  return (
    <div className={listStackClass}>
      {inventoryItems.map((item) => (
        <article
          className={cn(
            'flex min-h-16 items-center justify-between gap-3 rounded-lg border border-[#EEECCC] p-3',
            item.status === 'safe'
              ? 'bg-white'
              : item.status === 'soon'
                ? 'bg-[#FBF4D6]'
                : 'bg-[#FFF0E8]',
          )}
          key={item.id}
        >
          <div className="grid gap-0.5">
            <strong className="text-[#272719]">{item.name}</strong>
            <span className="text-[0.8rem] text-[#68684C]">
              {item.location} · {item.quantity}
            </span>
          </div>
          <div className="grid justify-items-end gap-0.5">
            <strong className="text-[#272719]">
              {item.daysLeft < 0 ? '초과' : `D-${item.daysLeft}`}
            </strong>
            <span className="text-[0.8rem] text-[#68684C]">
              {item.status === 'safe' ? '정상' : item.status === 'soon' ? '임박' : '확인'}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}

function FilterPanel() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {['냉장', '냉동', '임박', '최근 등록'].map((filter) => (
        <button type="button" className={pillButtonClass} key={filter}>
          {filter}
        </button>
      ))}
    </div>
  )
}

function IngredientDetail() {
  return (
    <div className={softCardClass}>
      <span className="text-[0.74rem] font-black text-[#9F9F30]">대표 재료</span>
      <strong className="text-[#272719]">두부 1모</strong>
      <p className="m-0 text-[0.86rem] leading-[1.42] text-[#68684C]">
        냉장 보관 · 소비기한 D-2 · 영수증에서 자동 등록
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white px-2.5 py-1.5 text-[0.74rem] font-black text-[#9F9F30]">
          추천 3개
        </span>
        <span className="rounded-full bg-white px-2.5 py-1.5 text-[0.74rem] font-black text-[#9F9F30]">
          최근 수정 오늘
        </span>
      </div>
    </div>
  )
}

function IngredientForm({ mode }: { mode: 'add' | 'edit' }) {
  return (
    <form className="grid gap-2.5">
      <MockInput label="이름" value={mode === 'add' ? '방울토마토' : '두부'} />
      <MockInput label="수량" value={mode === 'add' ? '12알' : '1모'} />
      <MockInput label="보관 위치" value="냉장" />
      <button type="button" className={primaryActionClass}>
        {mode === 'add' ? '등록하기' : '수정 저장'}
      </button>
    </form>
  )
}

function MockInput({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid gap-1.5 text-[0.82rem] font-extrabold text-[#68684C]">
      {label}
      <input
        className="min-h-11 rounded-lg border border-[#E2E0BD] bg-white px-3 font-normal text-[#272719]"
        readOnly
        value={value}
      />
    </label>
  )
}

function DeleteConfirm() {
  return (
    <div className={softCardClass}>
      <strong className="text-[#272719]">상추를 폐기 처리할까요?</strong>
      <p className="m-0 text-[0.86rem] leading-[1.42] text-[#68684C]">
        폐기 사유는 다음 추천과 소비 패턴 분석에 반영됨
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={secondaryActionClass}>
          취소
        </button>
        <button type="button" className={primaryActionClass}>
          폐기
        </button>
      </div>
    </div>
  )
}

function LensMock({ step }: { step: LensStepId }) {
  if (step === 'camera') {
    return (
      <div className="relative grid min-h-[330px] place-items-center overflow-hidden rounded-lg bg-[#272719] text-[#F8F7E8]">
        <div className="absolute inset-11 rounded-lg border-2 border-[#BDBB40]" />
        <strong>카메라 프레임</strong>
        <span className="self-start text-[0.84rem] font-extrabold text-[#D8D67A]">
          영수증 / 냉장고 / 식판
        </span>
      </div>
    )
  }

  if (step === 'analyzing') {
    return (
      <div className="grid gap-2 rounded-lg border border-[#EEECCC] bg-[#F4F8DF] p-3.5">
        <div className="h-[9px] overflow-hidden rounded-full bg-[#E2E0BD]">
          <span className="block h-full w-[72%] rounded-full bg-[#BDBB40]" />
        </div>
        <strong className="text-[#272719]">OCR 72% · 식재료 후보 추출 중</strong>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className={softCardClass}>
        <strong className="text-[#272719]">등록 완료</strong>
        <p className="m-0 text-[0.86rem] leading-[1.42] text-[#68684C]">
          두부, 애호박, 버섯, 상추, 달걀, 양파가 인벤토리에 추가됨
        </p>
      </div>
    )
  }

  if (step === 'manual') {
    return (
      <div className="grid gap-2 rounded-lg border border-[#EEECCC] bg-white p-3.5">
        <p className="m-0 text-[0.86rem] leading-[1.42] text-[#68684C]">
          두부 한 모 냉장 3일, 애호박 반 개 오늘까지
        </p>
        <button type="button" className={primaryActionClass}>
          문장 분석
        </button>
      </div>
    )
  }

  return (
    <div className={listStackClass}>
      {inventoryItems.slice(0, 3).map((item) => (
        <article
          className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-[#EEECCC] bg-[#FBF4D6] p-3"
          key={item.id}
        >
          <div className="grid gap-0.5">
            <strong className="text-[#272719]">{item.name}</strong>
            <span className="text-[0.8rem] text-[#68684C]">
              {item.location} · 후보 신뢰도 86%
            </span>
          </div>
          <button type="button" className={pillButtonClass}>
            수정
          </button>
        </article>
      ))}
    </div>
  )
}

function RecipeList({ savedOnly = false }: { savedOnly?: boolean }) {
  const recipes = savedOnly ? recipeCards.filter((recipe) => recipe.saved) : recipeCards

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {recipes.map((recipe) => (
        <article className={softCardClass} key={recipe.id}>
          <span className="text-[0.74rem] font-black text-[#9F9F30]">{recipe.time}</span>
          <strong className="text-[#272719]">{recipe.name}</strong>
          <p className="m-0 text-[0.86rem] leading-[1.42] text-[#68684C]">
            {recipe.ingredients}
          </p>
          <em className="w-fit rounded-full bg-[#F4F8DF] px-2 py-1 text-[0.72rem] font-black not-italic text-[#272719]">
            {recipe.saved ? '저장됨' : '추천'}
          </em>
        </article>
      ))}
    </div>
  )
}

function RecipeConditions() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {['15분 이하', '불 없이', '매운맛 제외', '임박 재료 우선'].map((item) => (
        <button type="button" className={pillButtonClass} key={item}>
          {item}
        </button>
      ))}
    </div>
  )
}

function RecipeDetail() {
  return (
    <div className={softCardClass}>
      <span className="text-[0.74rem] font-black text-[#9F9F30]">매칭률 92%</span>
      <strong className="text-[#272719]">애호박 두부 덮밥</strong>
      <p className="m-0 text-[0.86rem] leading-[1.42] text-[#68684C]">
        필요 재료: 두부 1/2모, 애호박 1/2개, 버섯 60g
      </p>
      <ol className="m-0 pl-5 leading-[1.55] text-[#68684C]">
        <li>재료를 작게 썰기</li>
        <li>소스와 함께 볶기</li>
        <li>밥 위에 올리고 완료 처리</li>
      </ol>
    </div>
  )
}

function RecipeComplete() {
  return (
    <div className={softCardClass}>
      <strong className="text-[#272719]">요리 완료</strong>
      <p className="m-0 text-[0.86rem] leading-[1.42] text-[#68684C]">
        두부 1/2모, 애호박 1/2개, 버섯 60g 차감 예정
      </p>
      <button type="button" className={primaryActionClass}>
        차감 확인
      </button>
    </div>
  )
}

function toneBackground(tone: HomeState['tone'] | string) {
  if (tone === 'warning' || tone === 'soon') return 'bg-[#FBF4D6]'
  if (tone === 'danger' || tone === 'overdue') return 'bg-[#FFF0E8]'
  if (tone === 'ready' || tone === 'safe') return 'bg-[#F4F8DF]'
  return 'bg-white'
}
