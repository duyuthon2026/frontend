import { useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Icon } from '../../components/ui/Icons'
import { QuantityInput } from '../../components/ui/QuantityInput'
import { SwipeableBottomSheet } from '../../components/ui/SwipeableBottomSheet'
import { cn } from '../../lib/cn'
import {
  formatQuantityLabel,
  getDefaultQuantityUnit,
  parseQuantityLabel,
} from '../../lib/quantity'
import { usePrototypeStore } from '../../stores/usePrototypeStore'
import {
  calculateDaysLeft,
  calculateStatus,
  storageLocations,
  type InventoryItem,
  type StorageLocation,
} from '../../domain/prototype'
import { getRelativeDateString } from '../../lib/date'

type FilterType = 'all' | '냉장' | '냉동' | '실온' | '임박'
type FormSubmitEvent = { preventDefault: () => void }

const filterTypes: FilterType[] = ['all', '냉장', '냉동', '실온', '임박']

export function InventoryTab() {
  const items = usePrototypeStore((state) => state.items)
  const addItem = usePrototypeStore((state) => state.addItem)
  const removeItem = usePrototypeStore((state) => state.removeItem)
  const updateItem = usePrototypeStore((state) => state.updateItem)
  const selectedIngredientIds = usePrototypeStore((state) => state.selectedIngredientIds)
  const toggleSelectedIngredientId = usePrototypeStore((state) => state.toggleSelectedIngredientId)

  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formName, setFormName] = useState('')
  const [formQuantityAmount, setFormQuantityAmount] = useState('')
  const [formQuantityUnit, setFormQuantityUnit] = useState('개')
  const [formLocation, setFormLocation] = useState<StorageLocation>('냉장')
  const [formExpiresAt, setFormExpiresAt] = useState('')

  const selectedItem = items.find((i) => i.id === selectedItemId)

  const handleCloseDetail = useCallback(() => {
    setSelectedItemId(null)
    setIsEditing(false)
    setIsDeleting(false)
  }, [])

  const handleCloseAdd = useCallback(() => {
    setIsAddOpen(false)
  }, [])

  const handleOpenDetail = (item: InventoryItem) => {
    setIsAddOpen(false)
    setSelectedItemId(item.id)
    setIsEditing(false)
    setIsDeleting(false)
  }

  const handleOpenAdd = () => {
    setSelectedItemId(null)
    setIsEditing(false)
    setIsDeleting(false)
    setFormName('')
    setFormQuantityAmount('')
    setFormQuantityUnit('개')
    setFormLocation('냉장')
    setFormExpiresAt(getRelativeDateString(3))
    setIsAddOpen(true)
  }

  const handleFormNameChange = (name: string) => {
    setFormName(name)
    if (isAddOpen && !selectedItem) {
      setFormQuantityUnit(getDefaultQuantityUnit(name, '개'))
    }
  }

  const handleAddSubmit = (e: FormSubmitEvent) => {
    e.preventDefault()
    if (!formName) return
    addItem({
      name: formName,
      quantity: formatQuantityLabel(formQuantityAmount, formQuantityUnit),
      location: formLocation,
      expiresAt: formExpiresAt || getRelativeDateString(3),
    })
    setIsAddOpen(false)
  }

  const handleStartEdit = () => {
    if (!selectedItem) return
    const parsedQuantity = parseQuantityLabel(
      selectedItem.quantity,
      getDefaultQuantityUnit(selectedItem.name, '개'),
    )
    setFormName(selectedItem.name)
    setFormQuantityAmount(parsedQuantity.amount)
    setFormQuantityUnit(parsedQuantity.unit)
    setFormLocation(selectedItem.location)
    setFormExpiresAt(selectedItem.expiresAt)
    setIsEditing(true)
  }

  const handleEditSubmit = (e: FormSubmitEvent) => {
    e.preventDefault()
    if (!selectedItem || !formName) return
    updateItem(selectedItem.id, {
      name: formName,
      quantity: formatQuantityLabel(formQuantityAmount, formQuantityUnit),
      location: formLocation,
      expiresAt: formExpiresAt || selectedItem.expiresAt,
    })
    setIsEditing(false)
  }

  const handleDeleteConfirm = () => {
    if (!selectedItemId) return
    removeItem(selectedItemId)
    setSelectedItemId(null)
    setIsDeleting(false)
  }

  const filteredItems = items.filter((item) => {
    const daysLeft = calculateDaysLeft(item.expiresAt)
    if (activeFilter === '냉장' && item.location !== '냉장') return false
    if (activeFilter === '냉동' && item.location !== '냉동') return false
    if (activeFilter === '실온' && item.location !== '실온') return false
    if (activeFilter === '임박' && (daysLeft < 0 || daysLeft > 2)) return false

    if (searchQuery.trim() !== '') {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase())
    }

    return true
  })

  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden flex items-center justify-between pt-3 pb-1">
        <div className="grid gap-1">
          <p className="m-0 text-[0.68rem] font-black uppercase tracking-widest text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
            인벤토리
          </p>
          <h1 className="m-0 text-[1.8rem] leading-none font-extrabold tracking-tight text-[var(--color-content-default)]">
            나의 식재료 보관함
          </h1>
          <p className="m-0 text-[0.82rem] text-[var(--color-content-muted)]">
            보관 위치와 소비기한 기준으로 신선하게 보관하세요.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-[var(--color-on-primary)] hover:text-[var(--color-on-secondary)] font-extrabold shadow-[var(--shadow-glass)] transition-all duration-300 border-0 cursor-pointer"
          aria-label="재료 추가"
        >
          <Icon.Plus size={20} />
        </button>
      </section>

      <div className="grid gap-3">
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-[var(--color-content-subtle)]">
            <Icon.Search size={16} />
          </span>
          <input
            type="text"
            placeholder="보관 중인 식재료 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-10 pl-10 pr-10 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] text-[0.84rem] text-[var(--color-content-default)] placeholder-[var(--color-content-subtle)] focus:outline-none focus:border-[var(--color-primary)] transition-colors shadow-[var(--shadow-glass)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-bg-sunken)] text-[var(--color-content-muted)] hover:text-[var(--color-content-default)] transition-colors border-0 cursor-pointer"
              aria-label="검색어 지우기"
            >
              <Icon.Close size={16} />
            </button>
          )}
        </div>

        <section className="flex flex-wrap items-center gap-1.5" aria-label="필터 리스트">
          {filterTypes.map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={cn(
                'px-3.5 py-1.5 rounded-full border text-[0.76rem] font-bold transition-all duration-300 cursor-pointer',
                activeFilter === filter
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] font-black border-[var(--color-primary)] shadow-[var(--shadow-glass)]'
                  : 'bg-[var(--color-bg-overlay)] border-[var(--color-border-default)] text-[var(--color-content-muted)] hover:text-[var(--color-content-default)]'
              )}
            >
              {filter === 'all' ? '전체' : filter}
            </button>
          ))}
        </section>
      </div>

      <section className="grid gap-2.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[var(--color-border-default)] rounded-2xl bg-[var(--color-bg-base)]">
            <Icon.Inventory size={36} className="mx-auto text-[var(--color-content-subtle)] mb-2" />
            <p className="text-[0.82rem] font-bold text-[var(--color-content-muted)]">
              보관 중인 재료가 없습니다.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const daysLeft = calculateDaysLeft(item.expiresAt)
            const status = calculateStatus(daysLeft)
            const isSafe = status === 'safe'
            const isSoon = status === 'soon'
            const isOverdue = daysLeft < 0
            const isSelected = selectedIngredientIds.includes(item.id)

            return (
              <article
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleOpenDetail(item)
                  }
                }}
                role="button"
                tabIndex={0}
                className={cn(
                  'flex items-center justify-between gap-4 rounded-xl border p-3.5 transition-all duration-300 hover:translate-y-[-1px] cursor-pointer shadow-[var(--shadow-glass)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-app)]',
                  isSafe
                    ? 'border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] hover:border-[var(--color-border-brand)]'
                    : isSoon
                      ? 'border-[var(--color-border-brand)] bg-gradient-to-r from-[var(--color-bg-overlay)] to-[var(--color-surface-warning-soft)]/20'
                      : 'border-[var(--color-error)]/30 bg-gradient-to-r from-[var(--color-bg-overlay)] to-[var(--color-surface-danger-soft)]/20'
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSelectedIngredientId(item.id)
                    }}
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-md border transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-on-primary)]'
                        : 'border-[var(--color-border-default)] bg-transparent text-transparent'
                    )}
                    aria-label={`${item.name} 선택`}
                  >
                    <Icon.Check size={14} />
                  </button>

                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border text-xs',
                      isSafe
                        ? 'border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[var(--color-content-muted)]'
                        : isSoon
                          ? 'border-[var(--color-border-brand)] bg-[var(--color-bg-base)] text-[var(--color-secondary)]'
                          : 'border-[var(--color-error)] bg-[var(--color-bg-base)] text-[var(--color-error)]'
                    )}
                  >
                    {isSafe ? (
                      <Icon.Check size={16} />
                    ) : isSoon ? (
                      <Icon.AlertTriangle size={16} />
                    ) : (
                      <Icon.Trash size={16} />
                    )}
                  </div>
                  <div className="grid gap-0.5">
                    <strong className="text-[0.92rem] font-extrabold text-[var(--color-content-default)]">
                      {item.name}
                    </strong>
                    <span className="text-[0.74rem] font-bold text-[var(--color-content-muted)]">
                      {item.location} · {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="grid justify-items-end gap-0.5">
                  <strong
                    className={cn(
                      'text-[0.8rem] font-black px-2 py-0.5 rounded-md border',
                      isSafe
                        ? 'border-[var(--color-border-default)] bg-transparent text-[var(--color-content-muted)]'
                        : isSoon
                          ? 'border-[var(--color-primary)] bg-[var(--color-surface-brand-soft)] text-[var(--color-content-brand)]'
                          : 'border-[var(--color-error)] bg-[var(--color-error)] text-[var(--color-content-inverse)]'
                    )}
                  >
                    {isOverdue ? '기한초과' : daysLeft === 0 ? '오늘' : `D-${daysLeft}`}
                  </strong>
                  <span className="text-[0.66rem] font-bold text-[var(--color-content-muted)]">
                    {isSafe ? '정상' : isSoon ? '임박' : '확인 필요'}
                  </span>
                </div>
              </article>
            )
          })
        )}
      </section>

      <AnimatePresence>
        {selectedItemId && selectedItem && (
          <>
            <SwipeableBottomSheet
              ariaLabel={`${selectedItem.name} 식재료 세부 정보`}
              onClose={handleCloseDetail}
            >
              {!isEditing ? (
                <div className="grid gap-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[0.64rem] font-black uppercase tracking-wider text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
                        식재료 세부 정보
                      </span>
                      <h2 className="text-[1.3rem] font-extrabold text-[var(--color-content-default)] leading-none mt-1">
                        {selectedItem.name}
                      </h2>
                    </div>
                    <strong
                      className={cn(
                        'text-[0.88rem] font-black px-2.5 py-0.5 rounded-md border',
                        calculateStatus(calculateDaysLeft(selectedItem.expiresAt)) === 'safe'
                          ? 'border-[var(--color-border-default)] bg-transparent text-[var(--color-content-muted)]'
                          : calculateStatus(calculateDaysLeft(selectedItem.expiresAt)) === 'soon'
                            ? 'border-[var(--color-primary)] bg-[var(--color-surface-brand-soft)] text-[var(--color-content-brand)]'
                            : 'border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]'
                      )}
                    >
                      {calculateDaysLeft(selectedItem.expiresAt) < 0 ? '기한초과' : calculateDaysLeft(selectedItem.expiresAt) === 0 ? '오늘' : `D-${calculateDaysLeft(selectedItem.expiresAt)}`}
                    </strong>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-[var(--color-bg-base)] p-4 rounded-xl border border-[var(--color-border-default)]">
                    <div>
                      <span className="text-[0.7rem] font-bold text-[var(--color-content-muted)]">수량</span>
                      <p className="text-[0.9rem] font-extrabold text-[var(--color-content-default)] mt-0.5">
                        {selectedItem.quantity}
                      </p>
                    </div>
                    <div>
                      <span className="text-[0.7rem] font-bold text-[var(--color-content-muted)]">보관 위치</span>
                      <p className="text-[0.9rem] font-extrabold text-[var(--color-content-default)] mt-0.5">
                        {selectedItem.location}
                      </p>
                    </div>
                  </div>

                  {!isDeleting ? (
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="min-h-11 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[0.84rem] font-bold text-[var(--color-content-default)] hover:border-[var(--color-border-brand)] transition-colors cursor-pointer"
                      >
                        정보 수정
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDeleting(true)}
                        className="min-h-11 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 text-[0.84rem] font-bold transition-colors border-0 cursor-pointer"
                      >
                        폐기 / 삭제
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3 border border-[var(--color-error)]/30 bg-[var(--color-surface-danger-soft)]/20 p-4 rounded-xl">
                      <strong className="text-[0.92rem] font-extrabold text-[var(--color-content-default)]">
                        식재료를 냉장고에서 폐기하시겠습니까?
                      </strong>
                      <p className="text-[0.76rem] text-[var(--color-content-muted)] leading-relaxed m-0">
                        폐기 사유는 가구 소비 습관 분석 및 맞춤형 소진 추천에 자동 반영됩니다.
                      </p>
                      <div className="grid grid-cols-2 gap-2.5 mt-1">
                        <button
                          type="button"
                          onClick={() => setIsDeleting(false)}
                          className="min-h-9 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[0.78rem] font-bold text-[var(--color-content-default)] cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteConfirm}
                          className="min-h-9 rounded-lg bg-[var(--color-error)] text-[var(--color-content-inverse)] text-[0.78rem] font-bold border-0 cursor-pointer"
                        >
                          폐기 확정
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="grid gap-4.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.74rem] font-black uppercase tracking-wider text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
                      재료 정보 수정
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-[0.74rem] font-bold text-[var(--color-content-muted)] hover:underline border-0 bg-transparent cursor-pointer"
                    >
                      취소
                    </button>
                  </div>

                  <div className="grid gap-3.5">
                    <label className="grid gap-1.5 text-[0.76rem] font-extrabold text-[var(--color-content-muted)]">
                      재료 이름
                      <input
                        className="min-h-10 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[var(--color-content-default)] px-4 font-normal focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                      />
                    </label>

                    <div className="grid grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] gap-3.5">
                      <QuantityInput
                        amount={formQuantityAmount}
                        label="수량"
                        onAmountChange={setFormQuantityAmount}
                        unit={formQuantityUnit}
                      />
                      <label className="grid gap-1.5 text-[0.76rem] font-extrabold text-[var(--color-content-muted)]">
                        소비기한
                        <input
                          type="date"
                          className="min-h-10 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[var(--color-content-default)] px-4 font-normal focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                          value={formExpiresAt}
                          onChange={(e) => setFormExpiresAt(e.target.value)}
                          required
                        />
                      </label>
                    </div>

                    <p className="m-0 rounded-lg bg-[var(--color-bg-base)] px-3 py-2 text-[0.7rem] font-semibold text-[var(--color-content-muted)]">
                      단위는 기존 식재료 기준으로 고정됩니다. 숫자만 빠르게 수정하세요.
                    </p>

                    <div className="grid gap-1.5 text-[0.76rem] font-extrabold text-[var(--color-content-muted)]">
                      보관 위치
                      <div className="grid grid-cols-3 gap-2">
                        {storageLocations.map((loc) => (
                          <button
                            type="button"
                            key={loc}
                            onClick={() => setFormLocation(loc)}
                            aria-pressed={formLocation === loc}
                            className={cn(
                              'min-h-10 rounded-xl border text-[0.8rem] font-bold transition-all cursor-pointer',
                              formLocation === loc
                                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-on-primary)] font-black'
                                : 'bg-[var(--color-bg-base)] border-[var(--color-border-default)] text-[var(--color-content-muted)]'
                            )}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 min-h-11 w-full rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-extrabold text-[0.85rem] shadow-[var(--shadow-glass)] transition-all active:scale-95 border-0 mt-2 cursor-pointer"
                  >
                    수정 완료
                  </button>
                </form>
              )}
            </SwipeableBottomSheet>
          </>
        )}

        {isAddOpen && (
          <>
            <SwipeableBottomSheet
              ariaLabel="새로운 식재료 직접 등록"
              onClose={handleCloseAdd}
            >
              <form onSubmit={handleAddSubmit} className="grid gap-4.5">
                <div className="flex items-center justify-between">
                  <span className="text-[0.74rem] font-black uppercase tracking-wider text-[var(--color-secondary)] dark:text-[var(--color-tertiary)]">
                    새로운 식재료 직접 등록
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="text-[0.74rem] font-bold text-[var(--color-content-muted)] hover:underline border-0 bg-transparent cursor-pointer"
                  >
                    취소
                  </button>
                </div>

                <div className="grid gap-3.5">
                  <label className="grid gap-1.5 text-[0.76rem] font-extrabold text-[var(--color-content-muted)]">
                    재료 이름
                    <input
                      className="min-h-10 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-4 font-normal text-[var(--color-content-default)] transition-colors focus:border-[var(--color-primary)] focus:outline-none"
                      value={formName}
                      onChange={(e) => handleFormNameChange(e.target.value)}
                      placeholder="예: 토마토, 연어"
                      required
                    />
                  </label>

                  <div className="grid grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] gap-3.5">
                    <QuantityInput
                      amount={formQuantityAmount}
                      label="수량"
                      onAmountChange={setFormQuantityAmount}
                      unit={formQuantityUnit}
                    />
                    <label className="grid gap-1.5 text-[0.76rem] font-extrabold text-[var(--color-content-muted)]">
                      소비기한
                      <input
                        type="date"
                        className="min-h-10 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-4 font-normal text-[var(--color-content-default)] transition-colors focus:border-[var(--color-primary)] focus:outline-none"
                        value={formExpiresAt}
                        onChange={(e) => setFormExpiresAt(e.target.value)}
                        required
                      />
                    </label>
                  </div>

                  <p className="m-0 rounded-lg bg-[var(--color-bg-base)] px-3 py-2 text-[0.7rem] font-semibold text-[var(--color-content-muted)]">
                    단위는 식재료명에 맞춰 자동 고정됩니다. 사용자는 숫자만 입력합니다.
                  </p>

                  <div className="grid gap-1.5 text-[0.76rem] font-extrabold text-[var(--color-content-muted)]">
                    보관 위치
                    <div className="grid grid-cols-3 gap-2">
                      {storageLocations.map((loc) => (
                        <button
                          type="button"
                          key={loc}
                          onClick={() => setFormLocation(loc)}
                          aria-pressed={formLocation === loc}
                          className={cn(
                            'min-h-10 rounded-xl border text-[0.8rem] font-bold transition-all cursor-pointer',
                            formLocation === loc
                              ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-on-primary)] font-black'
                              : 'bg-[var(--color-bg-base)] border-[var(--color-border-default)] text-[var(--color-content-muted)]'
                          )}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-0 bg-[var(--color-primary)] text-[0.85rem] font-extrabold text-[var(--color-on-primary)] shadow-[var(--shadow-glass)] transition-all active:scale-95 cursor-pointer"
                >
                  보관함에 추가
                </button>
              </form>
            </SwipeableBottomSheet>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
