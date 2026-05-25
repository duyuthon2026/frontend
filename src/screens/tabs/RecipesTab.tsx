import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '../../components/ui/Icons'
import { IngredientIcon } from '../../components/ui/IngredientIcon'
import { SwipeableBottomSheet } from '../../components/ui/SwipeableBottomSheet'
import { AccountRequiredCard } from '../../features/auth/AuthSession'
import { useAuthSession } from '../../features/auth/authSessionContext'
import { usePrototypeStore } from '../../stores/usePrototypeStore'
import { cn } from '../../lib/cn'
import { sendRecipeFeedback, shouldUseBackendApi, type RecipeFeedbackAction } from '../../lib/backendApi'
import { calculateDaysLeft, type RecipeCard } from '../../domain/prototype'

type FilterMode = 'recommend' | 'saved'

const conditionFilters = ['15분 이하 요리', '불 없이 간편하게', '아이용 순한 맛', '임박 식재료 최우선']

const foldVariants = {
  closed: {
    clipPath: 'inset(0% 0% 100% 0% round 16px)',
    height: 0,
    opacity: 0,
  },
  open: {
    clipPath: 'inset(0% 0% 0% 0% round 16px)',
    height: 'auto',
    opacity: 1,
  },
}

const chipVariants = {
  closed: { opacity: 0, scale: 0.96, y: -4 },
  open: { opacity: 1, scale: 1, y: 0 },
}

export function RecipesTab() {
  const items = usePrototypeStore((state) => state.items)
  const recipes = usePrototypeStore((state) => state.recipes)
  const consumeRecipe = usePrototypeStore((state) => state.consumeRecipe)
  const recipeConsumeReviewMessage = usePrototypeStore((state) => state.recipeConsumeReviewMessage)
  const toggleSaveRecipe = usePrototypeStore((state) => state.toggleSaveRecipe)
  const selectedIngredientIds = usePrototypeStore((state) => state.selectedIngredientIds)
  const toggleSelectedIngredientId = usePrototypeStore((state) => state.toggleSelectedIngredientId)
  const setSelectedIngredientIds = usePrototypeStore((state) => state.setSelectedIngredientIds)
  const { canUseBackendAccount, requiresAccount } = useAuthSession()

  const [filterMode, setFilterMode] = useState<FilterMode>('recommend')
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showConditions, setShowConditions] = useState(false)
  const [activeConditions, setActiveConditions] = useState<string[]>([])
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isSendingFeedback, setIsSendingFeedback] = useState(false)
  const [suppressedRecipeIds, setSuppressedRecipeIds] = useState<string[]>([])

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId)
  const hasScopedIngredients = selectedIngredientIds.length > 0
  const selectedIdSet = new Set(selectedIngredientIds)
  const recipeScopeItems = hasScopedIngredients
    ? items.filter((item) => selectedIdSet.has(item.id))
    : items

  const analyzeRecipeIngredients = (recipe: RecipeCard) => {
    const analysis = recipe.ingredients.map((ing) => {
      const nameLower = ing.name.toLowerCase()
      const matchingItem = recipeScopeItems.find((item) => {
        const itemLower = item.name.toLowerCase()
        return itemLower.includes(nameLower) || nameLower.includes(itemLower)
      })

      if (matchingItem) {
        return {
          ...ing,
          status: hasScopedIngredients ? 'selected' : 'owned',
          itemId: matchingItem.id,
        }
      } else {
        return {
          ...ing,
          status: 'missing',
          itemId: null,
        }
      }
    })

    const selectedCount = analysis.filter((a) => a.status === 'selected').length
    const ownedCount = analysis.filter((a) => a.status === 'owned').length
    const totalCount = recipe.ingredients.length
    const matchPercentage = totalCount === 0 ? 0 : Math.round(((selectedCount + ownedCount) / totalCount) * 100)

    return {
      ingredients: analysis,
      selectedCount,
      ownedCount,
      totalCount,
      matchPercentage,
    }
  }

  const displayedRecipes = recipes.filter((recipe) => {
    if (suppressedRecipeIds.includes(recipe.id)) return false
    if (filterMode === 'saved' && !recipe.saved) return false
    const matchInfo = analyzeRecipeIngredients(recipe)

    if (filterMode === 'recommend' && matchInfo.selectedCount + matchInfo.ownedCount === 0) {
      return false
    }

    if (activeConditions.length > 0) {
      return activeConditions.every((cond) => {
        if (cond === '15분 이하 요리') {
          const mins = Number.parseInt(recipe.time, 10)
          return mins <= 15
        }
        if (cond === '불 없이 간편하게') {
          return recipe.name.includes('겉절이') || recipe.name.includes('샐러드')
        }
        if (cond === '아이용 순한 맛') {
          return recipe.name.includes('덮밥') || recipe.name.includes('된장국')
        }
        if (cond === '임박 식재료 최우선') {
          const recipeIngredients = recipe.ingredients.map((i) => i.name.toLowerCase())
          const soonIngredients = recipeScopeItems
            .filter((i) => {
              const dl = calculateDaysLeft(i.expiresAt)
              return dl >= 0 && dl <= 2
            })
            .map((i) => i.name.toLowerCase())
          return recipeIngredients.some((ri) => soonIngredients.some((si) => si.includes(ri) || ri.includes(si)))
        }
        return true
      })
    }

    return true
  })

  const sortedRecipes = displayedRecipes.some((recipe) => recipe.recommendationReasons?.length)
    ? displayedRecipes
    : [...displayedRecipes].sort((a, b) => {
    const analysisA = analyzeRecipeIngredients(a)
    const analysisB = analyzeRecipeIngredients(b)
    if (analysisA.selectedCount !== analysisB.selectedCount) {
      return analysisB.selectedCount - analysisA.selectedCount
    }
    return analysisB.matchPercentage - analysisA.matchPercentage
  })

  const handleOpenDetail = (recipe: RecipeCard) => {
    setSelectedRecipeId(recipe.id)
    setIsCompleted(false)
  }

  const handleCompleteRecipe = () => {
    if (!canUseBackendAccount) return
    if (!selectedRecipeId) return
    void consumeRecipe(selectedRecipeId)
    setIsCompleted(true)
  }

  const handleRecipeFeedback = async (action: RecipeFeedbackAction) => {
    if (!canUseBackendAccount || !selectedRecipe) return
    setIsSendingFeedback(true)
    setFeedbackMessage(null)

    try {
      if (shouldUseBackendApi()) {
        await sendRecipeFeedback(
          selectedRecipe.id,
          action,
          action === 'disliked' ? selectedRecipe.ingredients.map((ingredient) => ingredient.name) : [],
        )
        await setSelectedIngredientIds(selectedIngredientIds)
      }
      if (action === 'not_today') {
        setSuppressedRecipeIds((ids) => [selectedRecipe.id, ...ids.filter((id) => id !== selectedRecipe.id)])
      }
      setFeedbackMessage(action === 'disliked' ? '취향 제외에 반영했습니다.' : '이번 추천에서 뒤로 보내도록 기록했습니다.')
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : '레시피 피드백 저장 실패')
    } finally {
      setIsSendingFeedback(false)
    }
  }

  const handleCloseSheet = () => {
    setSelectedRecipeId(null)
    setIsCompleted(false)
    setFeedbackMessage(null)
  }

  const handleToggleRecipeScopeItem = (itemId: string) => {
    if (!canUseBackendAccount) return
    if (hasScopedIngredients) {
      void toggleSelectedIngredientId(itemId)
      return
    }
    void setSelectedIngredientIds([itemId])
  }

  const toggleCondition = (cond: string) => {
    if (activeConditions.includes(cond)) {
      setActiveConditions(activeConditions.filter((c) => c !== cond))
    } else {
      setActiveConditions([...activeConditions, cond])
    }
  }

  const selectedItems = items.filter((item) => selectedIngredientIds.includes(item.id))
  const recipeScopeLabel = hasScopedIngredients
    ? `선택한 재료 ${selectedItems.length}개만 사용`
    : '전체 보유 재료 사용'

  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden flex items-center justify-between pt-3 pb-1">
        <div className="grid gap-1">
          <p className="m-0 text-[0.68rem] font-black uppercase tracking-widest text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
            레시피 추천
          </p>
          <h1 className="m-0 text-[1.8rem] leading-none font-extrabold tracking-tight text-[var(--color-content-default)]">
            남은 식재료 맞춤 요리
          </h1>
          <p className="m-0 text-[0.82rem] text-[var(--color-content-muted)]">
            보관 중인 식재료와 하나 이상 맞는 요리만 소진 우선 추천
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowConditions(!showConditions)}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 border border-0 cursor-pointer shadow-[var(--shadow-glass)]',
            showConditions
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
              : 'bg-[var(--color-bg-overlay)] text-[var(--color-content-muted)] hover:text-[var(--color-content-default)]'
          )}
          aria-label="필터 조건 설정"
          aria-expanded={showConditions}
        >
          <Icon.Filter size={18} />
        </button>
      </section>

      {requiresAccount && (
        <AccountRequiredCard actionLabel="레시피 저장, 식재료 선택, 요리 완료 차감은 가입 후 서버 데이터로 동기화됩니다." />
      )}

      <AnimatePresence>
        {showConditions && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={foldVariants}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 p-3 bg-[var(--color-bg-overlay)] border border-[var(--color-border-default)] rounded-xl shadow-[var(--shadow-glass)] mb-1">
              {conditionFilters.map((cond, index) => {
                const isActive = activeConditions.includes(cond)
                return (
                  <motion.button
                    type="button"
                    key={cond}
                    variants={chipVariants}
                    transition={{ type: 'spring', stiffness: 300, damping: 24, delay: index * 0.03 }}
                    onClick={() => toggleCondition(cond)}
                    aria-pressed={isActive}
                    className={cn(
                      'min-h-[38px] rounded-lg border text-[0.76rem] font-bold transition-all cursor-pointer',
                      isActive
                        ? 'border-[var(--color-primary)] bg-[var(--color-surface-brand-soft)] text-[var(--color-content-brand)]'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[var(--color-content-muted)] hover:border-[var(--color-border-brand)]'
                    )}
                  >
                    {cond}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {items.length > 0 && (
        <section className="grid gap-2 bg-[var(--color-bg-overlay)] border border-[var(--color-border-default)] p-3.5 rounded-2xl shadow-[var(--shadow-glass)]">
          <div className="flex items-center justify-between">
            <span className="text-[0.72rem] font-black uppercase tracking-wider text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
              레시피 접근 재료 · {recipeScopeLabel}
            </span>
            <button
              type="button"
              onClick={() => {
                if (canUseBackendAccount) void setSelectedIngredientIds([])
              }}
              disabled={!canUseBackendAccount || !hasScopedIngredients}
              className="text-[0.7rem] font-bold text-[var(--color-error)] hover:underline border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-55"
            >
              전체 사용
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {items.map((item) => {
              const isScoped = selectedIdSet.has(item.id)
              return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleToggleRecipeScopeItem(item.id)}
                aria-pressed={isScoped}
                disabled={!canUseBackendAccount}
                className={cn(
                  'flex min-h-8 items-center gap-1 rounded-full border px-2.5 py-1 text-[0.74rem] font-bold cursor-pointer disabled:cursor-not-allowed disabled:opacity-55',
                  isScoped
                    ? 'border-[var(--color-border-brand)] bg-[var(--color-surface-brand-soft)] text-[var(--color-content-brand)]'
                    : 'border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[var(--color-content-muted)] hover:border-[var(--color-border-brand)] hover:text-[var(--color-content-default)]',
                )}
              >
                <span>{item.name}</span>
                {isScoped && <span className="text-[0.64rem] opacity-60">×</span>}
              </button>
              )
            })}
          </div>
        </section>
      )}

      <section className="flex items-center gap-1.5" aria-label="메뉴 카테고리">
        <button
          type="button"
          onClick={() => setFilterMode('recommend')}
          aria-pressed={filterMode === 'recommend'}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-[0.76rem] font-bold transition-all border-0 cursor-pointer',
            filterMode === 'recommend'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] font-black shadow-[var(--shadow-glass)]'
              : 'bg-[var(--color-bg-overlay)] text-[var(--color-content-muted)] hover:text-[var(--color-content-default)]'
          )}
        >
          소진 추천 메뉴
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('saved')}
          aria-pressed={filterMode === 'saved'}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-[0.76rem] font-bold transition-all border-0 cursor-pointer',
            filterMode === 'saved'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] font-black shadow-[var(--shadow-glass)]'
              : 'bg-[var(--color-bg-overlay)] text-[var(--color-content-muted)] hover:text-[var(--color-content-default)]'
          )}
        >
          저장한 요리
        </button>
      </section>

      <section className="grid gap-3.5 md:grid-cols-2">
        {sortedRecipes.length === 0 ? (
          <div className="col-span-full text-center py-12 border border-dashed border-[var(--color-border-default)] rounded-2xl bg-[var(--color-bg-base)]">
            <Icon.Recipes size={36} className="mx-auto text-[var(--color-content-subtle)] mb-2" />
            <p className="text-[0.82rem] font-bold text-[var(--color-content-muted)]">
              {filterMode === 'saved'
                ? '저장된 레시피가 없습니다.'
                : items.length === 0
                  ? '보관함에 식재료를 먼저 등록하세요.'
                  : '보유 식재료와 매칭되는 레시피가 없습니다.'}
            </p>
          </div>
        ) : (
          sortedRecipes.map((recipe) => {
            const matchInfo = analyzeRecipeIngredients(recipe)

            return (
              <article
                key={recipe.id}
                onClick={() => handleOpenDetail(recipe)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleOpenDetail(recipe)
                  }
                }}
                role="button"
                tabIndex={0}
                className="relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] p-4 shadow-[var(--shadow-glass)] transition-all duration-300 hover:translate-y-[-1px] hover:border-[var(--color-border-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-app)]"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[0.7rem] font-bold text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
                      <Icon.Calendar size={12} />
                      소요 {recipe.time}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (canUseBackendAccount) void toggleSaveRecipe(recipe.id)
                      }}
                      disabled={!canUseBackendAccount}
                      aria-label={recipe.saved ? `${recipe.name} 저장 취소` : `${recipe.name} 저장`}
                      className="text-[var(--color-content-muted)] hover:text-red-500 cursor-pointer border-0 bg-transparent py-0 px-1 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon.Bookmark
                      size={16}
                      fill={recipe.saved}
                       className={cn(recipe.saved ? 'text-[var(--color-primary)]' : 'text-[var(--color-content-subtle)]')}
                      />
                    </button>
                  </div>
                  <strong className="text-[1.02rem] font-extrabold text-[var(--color-content-default)] leading-tight">
                    {recipe.name}
                  </strong>
                  {recipe.recommendationReasons?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {recipe.recommendationReasons.slice(0, 3).map((reason) => (
                        <span
                          key={reason}
                          className="rounded-md bg-[var(--color-surface-brand-soft)] px-2 py-0.5 text-[0.66rem] font-black text-[var(--color-content-brand)]"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {recipe.ingredients.map((ing, idx) => {
                      const analysis = matchInfo.ingredients[idx]
                      return (
                        <span
                          key={idx}
                          className={cn(
                            'flex items-center gap-1 px-2 py-0.5 rounded-md border text-[0.7rem] font-bold',
                            analysis.status === 'selected'
                              ? 'border-[var(--color-primary)] bg-[var(--color-surface-brand-soft)] text-[var(--color-content-brand)]'
                              : analysis.status === 'owned'
                                ? 'border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[var(--color-content-default)]'
                                : 'border-dashed border-[var(--color-border-default)] bg-transparent text-[var(--color-content-muted)]'
                          )}
                        >
                          <IngredientIcon name={ing.name} />
                          <span>{ing.name}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-default)] pt-2.5">
                  <span className="text-[0.7rem] font-bold text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
                    재료 매칭률 {matchInfo.matchPercentage}%
                    {matchInfo.selectedCount > 0 && ` (선택 재료 ${matchInfo.selectedCount}개 포함)`}
                  </span>
                  <span className="text-[0.7rem] font-bold text-[var(--color-content-muted)] hover:underline">
                    레시피 보기
                  </span>
                </div>
              </article>
            )
          })
        )}
      </section>

      <AnimatePresence>
        {selectedRecipeId && selectedRecipe && (
          <>
            <SwipeableBottomSheet
              ariaLabel={`${selectedRecipe.name} 레시피 상세`}
              onClose={handleCloseSheet}
            >
              {!isCompleted ? (
                <div className="grid gap-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[0.64rem] font-black uppercase tracking-wider text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
                        잔반제로 맞춤 소진 가이드
                      </span>
                      <h2 className="text-[1.3rem] font-extrabold text-[var(--color-content-default)] leading-none mt-1">
                        {selectedRecipe.name}
                      </h2>
                    </div>
                    <span className="text-[0.76rem] font-bold text-[var(--color-content-muted)]">
                      소요 {selectedRecipe.time}
                    </span>
                  </div>

                  {selectedRecipe.recommendationReasons?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedRecipe.recommendationReasons.slice(0, 4).map((reason) => (
                        <span
                          key={reason}
                          className="rounded-md bg-[var(--color-surface-brand-soft)] px-2 py-1 text-[0.68rem] font-black text-[var(--color-content-brand)]"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="grid gap-2 bg-[var(--color-bg-base)] p-4 rounded-xl border border-[var(--color-border-default)]">
                    <span className="text-[0.7rem] font-bold text-[var(--color-content-muted)]">소요 식재료 리스트</span>
                    <div className="grid gap-1.5 mt-1">
                      {selectedRecipe.ingredients.map((ing, idx) => {
                        const analysis = analyzeRecipeIngredients(selectedRecipe).ingredients[idx]
                        return (
                          <div key={idx} className="flex items-center justify-between text-[0.82rem]">
                            <div className="flex items-center gap-1.5">
                              <IngredientIcon name={ing.name} />
                              <span className="font-extrabold text-[var(--color-content-default)]">{ing.name}</span>
                              <span className="text-[var(--color-content-muted)]">({ing.quantity})</span>
                            </div>
                            <span className={cn(
                              'text-[0.7rem] font-black px-1.5 py-0.5 rounded border',
                              analysis.status === 'selected'
                                ? 'border-[var(--color-primary)] bg-[var(--color-surface-brand-soft)] text-[var(--color-content-brand)]'
                                : analysis.status === 'owned'
                                  ? 'border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[var(--color-content-default)]'
                                  : 'border-[var(--color-error)]/30 bg-[var(--color-surface-danger-soft)]/20 text-[var(--color-error)]'
                            )}>
                              {analysis.status === 'selected' ? '선택됨' : analysis.status === 'owned' ? '보유중' : '부족'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <strong className="text-[0.8rem] font-extrabold text-[var(--color-content-default)]">조리 순서 및 가이드</strong>
                    <ol className="m-0 pl-4 text-[0.78rem] leading-relaxed text-[var(--color-content-muted)] list-decimal grid gap-1">
                      <li>준비한 야채와 재료를 먹기 편한 크기로 알맞게 손질합니다.</li>
                      <li>중불에 팬을 올린 후, 올리브유와 함께 다진 야채를 가볍게 볶아줍니다.</li>
                      <li>남은 양념이나 소스를 얹은 후 정갈하게 그릇에 담아 완성합니다.</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (canUseBackendAccount) void toggleSaveRecipe(selectedRecipe.id)
                      }}
                      disabled={!canUseBackendAccount}
                      className="min-h-11 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[0.84rem] font-bold text-[var(--color-content-default)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {selectedRecipe.saved ? '보관 취소' : '요리 보관'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCompleteRecipe}
                      disabled={!canUseBackendAccount}
                      className="min-h-11 rounded-xl border-0 bg-[var(--color-primary)] text-[0.84rem] font-extrabold text-[var(--color-on-primary)] shadow-[var(--shadow-glass)] transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      요리 완료 (재료 차감)
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void handleRecipeFeedback('not_today')}
                      disabled={!canUseBackendAccount || isSendingFeedback}
                      className="min-h-10 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[0.78rem] font-bold text-[var(--color-content-default)] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      오늘 제외
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRecipeFeedback('disliked')}
                      disabled={!canUseBackendAccount || isSendingFeedback}
                      className="min-h-10 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[0.78rem] font-bold text-[var(--color-content-default)] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      취향 아님
                    </button>
                  </div>
                  {feedbackMessage && (
                    <p className="m-0 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 py-2 text-[0.72rem] font-bold text-[var(--color-content-muted)]">
                      {feedbackMessage}
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-5 text-center justify-items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success)] text-[var(--color-on-secondary)] shadow-md animate-bounce">
                    <Icon.Check size={22} />
                  </div>

                  <div className="grid gap-1">
                    <strong className="text-[1.12rem] font-extrabold text-[var(--color-content-default)]">
                      요리 완료 및 자동 차감 완료!
                    </strong>
                    <p className="m-0 text-[0.78rem] text-[var(--color-content-muted)] leading-relaxed max-w-[90%]">
                      레시피에 필요한 식재료들이 인벤토리 수량에서 자동으로 차감되거나 삭제되었습니다.
                    </p>
                    {recipeConsumeReviewMessage && (
                      <p className="m-0 rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-surface-warning-soft)]/30 px-3 py-2 text-[0.74rem] font-bold text-[var(--color-warning)]">
                        {recipeConsumeReviewMessage}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseSheet}
                    className="min-h-11 w-full rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-[0.84rem] font-extrabold text-[var(--color-content-default)] mt-2 cursor-pointer"
                  >
                    확인
                  </button>
                </div>
              )}
            </SwipeableBottomSheet>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
