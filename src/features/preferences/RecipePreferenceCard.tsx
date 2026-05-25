import { useEffect, useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { AccountRequiredCard } from '../auth/AuthSession'
import { useAuthSession } from '../auth/authSessionContext'
import {
  fetchRecipePreferences,
  shouldUseBackendApi,
  updateRecipePreferences,
  type RecipePreferenceDto,
} from '../../lib/backendApi'
import { usePrototypeStore } from '../../stores/usePrototypeStore'

export function RecipePreferenceCard() {
  const { canUseBackendAccount, requiresAccount } = useAuthSession()
  const selectedIngredientIds = usePrototypeStore((state) => state.selectedIngredientIds)
  const setSelectedIngredientIds = usePrototypeStore((state) => state.setSelectedIngredientIds)
  const [preferences, setPreferences] = useState<RecipePreferenceDto | null>(null)
  const [excludedText, setExcludedText] = useState('')
  const [allergyText, setAllergyText] = useState('')
  const [dislikedText, setDislikedText] = useState('')
  const [preferredCookTime, setPreferredCookTime] = useState('')
  const [mildFlavorPreferred, setMildFlavorPreferred] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function applyPreferenceState(nextPreferences: RecipePreferenceDto) {
    setPreferences(nextPreferences)
    setExcludedText(nextPreferences.excludedIngredients.join(', '))
    setAllergyText(nextPreferences.allergies.join(', '))
    setDislikedText(nextPreferences.dislikedFoods.join(', '))
    setPreferredCookTime(nextPreferences.preferredCookTimeMinutes?.toString() ?? '')
    setMildFlavorPreferred(Boolean(nextPreferences.mildFlavorPreferred))
  }

  useEffect(() => {
    if (!canUseBackendAccount || !shouldUseBackendApi()) {
      return undefined
    }

    let isCancelled = false
    fetchRecipePreferences()
      .then((nextPreferences) => {
        if (isCancelled) return
        applyPreferenceState(nextPreferences)
      })
      .catch((error) => {
        if (isCancelled) return
        setMessage(error instanceof Error ? error.message : '추천 설정을 불러오지 못했습니다.')
      })

    return () => {
      isCancelled = true
    }
  }, [canUseBackendAccount])

  const handleSave = async () => {
    if (!canUseBackendAccount) return
    setIsSaving(true)
    setMessage(null)

    try {
      const nextPreferences = await updateRecipePreferences({
        allergies: splitTerms(allergyText),
        dislikedFoods: splitTerms(dislikedText),
        excludedIngredients: splitTerms(excludedText),
        mildFlavorPreferred,
        preferredCookTimeMinutes: preferredCookTime.trim()
          ? Number(preferredCookTime)
          : null,
      })
      applyPreferenceState(nextPreferences)
      await setSelectedIngredientIds(selectedIngredientIds)
      setMessage('추천 설정이 저장되고 레시피 추천이 다시 계산되었습니다.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '추천 설정 저장 실패')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Panel
      className="gap-4"
      eyebrow="Personalize"
      title="식생활 추천 설정"
      description="못 먹는 재료와 선호 시간을 서버 추천에 반영합니다."
    >
      {requiresAccount && (
        <AccountRequiredCard
          actionLabel="개인화 추천 설정은 가입 후 서버 프로필에 저장됩니다."
          className="p-3"
        />
      )}
      <div className="grid gap-3">
        <TextPreferenceInput
          label="제외 재료"
          onChange={setExcludedText}
          placeholder="예: 고수, 오이"
          value={excludedText}
        />
        <TextPreferenceInput
          label="알레르기"
          onChange={setAllergyText}
          placeholder="예: 땅콩, 새우"
          value={allergyText}
        />
        <TextPreferenceInput
          label="못 먹는 메뉴/재료"
          onChange={setDislikedText}
          placeholder="예: 매운탕, 가지"
          value={dislikedText}
        />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
          <label className="grid gap-1 text-[0.72rem] font-black text-[var(--color-content-muted)]">
            선호 조리 시간
            <input
              type="number"
              min={5}
              max={240}
              inputMode="numeric"
              value={preferredCookTime}
              onChange={(event) => setPreferredCookTime(event.target.value)}
              className="min-h-10 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 text-[0.82rem] text-[var(--color-content-default)]"
              placeholder="15"
            />
          </label>
          <label className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 text-[0.74rem] font-bold text-[var(--color-content-default)]">
            <input
              type="checkbox"
              checked={mildFlavorPreferred}
              onChange={(event) => setMildFlavorPreferred(event.target.checked)}
            />
            순한 맛
          </label>
        </div>
      </div>
      {preferences && preferences.recentMeals.length > 0 && (
        <p className="m-0 text-[0.72rem] font-semibold text-[var(--color-content-muted)]">
          최근 먹은 메뉴: {preferences.recentMeals.slice(0, 3).map((meal) => meal.recipeName).join(', ')}
        </p>
      )}
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={!canUseBackendAccount || isSaving}
        className="min-h-11 rounded-xl border-0 bg-[var(--color-primary)] px-4 text-[0.84rem] font-extrabold text-[var(--color-on-primary)] shadow-[var(--shadow-glass)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? '저장 중' : '추천 설정 저장'}
      </button>
      {message && (
        <p className="m-0 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 py-2 text-[0.72rem] font-bold text-[var(--color-content-muted)]">
          {message}
        </p>
      )}
    </Panel>
  )
}

function TextPreferenceInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="grid gap-1 text-[0.72rem] font-black text-[var(--color-content-muted)]">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 text-[0.82rem] text-[var(--color-content-default)]"
        placeholder={placeholder}
      />
    </label>
  )
}

function splitTerms(value: string): string[] {
  return value
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean)
}
