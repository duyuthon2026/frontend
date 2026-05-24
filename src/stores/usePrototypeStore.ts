import { create } from 'zustand'
import {
  type AppTabId,
  type HomeStateId,
  type InventoryViewId,
  type LensStepId,
  type RecipeViewId,
  type StorageLocation,
  type InventoryItem,
  type RecipeCard,
  inventoryItems as initialItems,
  isStorageLocation,
  recipeCards as initialRecipes,
} from '../domain/prototype'
import {
  consumeRecipeOnBackend,
  createInventoryItem,
  createInventoryItemsBatch,
  deleteInventoryItem,
  fetchInventoryItems,
  fetchInventorySelection,
  fetchRecipes,
  importPrototypeState,
  saveInventorySelection,
  saveRecipe,
  shouldUseBackendApi,
  updateInventoryItem,
} from '../lib/backendApi'
import { getRelativeDateString, isIsoLocalDateString } from '../lib/date'

const legacyPrototypeStoreKey = 'prototype-store'

const createItemId = (scope: string) =>
  `i_${Date.now()}_${scope}_${Math.random().toString(36).slice(2, 11)}`

export const reduceQuantityLabel = (quantity: string) => {
  const trimmed = quantity.trim()
  const fractionalCount = trimmed.match(/^\d+\s*\/\s*\d+\s*(개|팩|송이|장|알|모)$/)
  if (fractionalCount) return null

  const grams = trimmed.match(/^(\d+)\s*g$/i)

  if (grams) {
    const remaining = Math.round(Number(grams[1]) * 0.65)
    return remaining >= 50 ? `${remaining}g` : null
  }

  const count = trimmed.match(/^(\d+)\s*(개|팩|송이|장|알|모)$/)
  if (count) {
    const remaining = Number(count[1]) - 1
    return remaining > 0 ? `${remaining}${count[2]}` : null
  }

  return trimmed || null
}

export type LensCandidate = {
  confidence?: number
  id: string
  name: string
  quantity: string
  location: StorageLocation
  expiresAt: string
}

export type PersistedPrototypeState = {
  items: InventoryItem[]
  recipes: RecipeCard[]
  selectedIngredientIds: string[]
}

type BackendStatus = 'idle' | 'loading' | 'ready' | 'error'
type StoreActionResult = Promise<boolean>
type RecipeIngredient = RecipeCard['ingredients'][number]

const initialCandidates: LensCandidate[] = [
  { id: 'c1', name: '방울토마토', quantity: '1팩', location: '냉장', expiresAt: getRelativeDateString(5) },
  { id: 'c2', name: '연어 필렛', quantity: '200g', location: '냉장', expiresAt: getRelativeDateString(2) },
  { id: 'c3', name: '브로콜리', quantity: '1송이', location: '냉장', expiresAt: getRelativeDateString(4) },
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const hasSameStringOrder = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index])

const normalizePersistedItem = (value: unknown): InventoryItem | null => {
  if (!isRecord(value)) return null

  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.name)) return null

  const daysLeft = value.daysLeft
  const expiresAt = isIsoLocalDateString(value.expiresAt)
    ? value.expiresAt
    : typeof daysLeft === 'number' && Number.isFinite(daysLeft)
      ? getRelativeDateString(daysLeft)
      : getRelativeDateString(3)

  return {
    id: value.id,
    name: value.name,
    quantity: isNonEmptyString(value.quantity) ? value.quantity : '1개',
    location: isStorageLocation(value.location) ? value.location : '냉장',
    expiresAt,
  }
}

const findRecipeAvatar = (name: string) => {
  const normalizedName = name.toLowerCase()
  const knownIngredient = initialRecipes
    .flatMap((recipe) => recipe.ingredients)
    .find((ingredient) => ingredient.name.toLowerCase() === normalizedName)

  return knownIngredient?.avatar ?? '🍽️'
}

const normalizePersistedIngredient = (value: unknown): RecipeIngredient | null => {
  if (!isRecord(value) || !isNonEmptyString(value.name)) return null

  return {
    name: value.name,
    quantity: isNonEmptyString(value.quantity) ? value.quantity : '적당량',
    avatar: isNonEmptyString(value.avatar) ? value.avatar : findRecipeAvatar(value.name),
  }
}

const normalizePersistedRecipe = (value: unknown): RecipeCard | null => {
  if (!isRecord(value)) return null
  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.name)) return null

  const rawIngredients = value.ingredients
  const ingredients = Array.isArray(rawIngredients)
    ? rawIngredients.flatMap((ingredient) => {
        const normalized = normalizePersistedIngredient(ingredient)
        return normalized ? [normalized] : []
      })
    : typeof rawIngredients === 'string'
      ? rawIngredients
          .split(',')
          .map((ingredientName) => ingredientName.trim())
          .filter(Boolean)
          .map((ingredientName) => ({
            name: ingredientName,
            quantity: '적당량',
            avatar: findRecipeAvatar(ingredientName),
          }))
      : []

  if (ingredients.length === 0) return null

  return {
    id: value.id,
    name: value.name,
    ingredients,
    saved: typeof value.saved === 'boolean' ? value.saved : false,
    time: isNonEmptyString(value.time) ? value.time : '15분',
  }
}

export const migratePersistedState = (persistedState: unknown): PersistedPrototypeState => {
  if (!isRecord(persistedState)) {
    return {
      items: initialItems,
      recipes: initialRecipes,
      selectedIngredientIds: [],
    }
  }

  const items = Array.isArray(persistedState.items)
    ? persistedState.items.flatMap((item) => {
        const normalized = normalizePersistedItem(item)
        return normalized ? [normalized] : []
      })
    : initialItems

  const recipes = Array.isArray(persistedState.recipes)
    ? persistedState.recipes.flatMap((recipe) => {
        const normalized = normalizePersistedRecipe(recipe)
        return normalized ? [normalized] : []
      })
    : initialRecipes

  const itemIds = new Set(items.map((item) => item.id))
  const selectedIngredientIds = Array.isArray(persistedState.selectedIngredientIds)
    ? persistedState.selectedIngredientIds.filter(
        (id): id is string => typeof id === 'string' && itemIds.has(id),
      )
    : []

  return {
    items,
    recipes,
    selectedIngredientIds,
  }
}

type PrototypeState = {
  activeHomeState: HomeStateId
  activeInventoryView: InventoryViewId
  activeLensStep: LensStepId
  activeRecipeView: RecipeViewId
  activeTab: AppTabId
  backendError: string | null
  backendStatus: BackendStatus
  setActiveHomeState: (state: HomeStateId) => void
  setActiveInventoryView: (view: InventoryViewId) => void
  setActiveLensStep: (step: LensStepId) => void
  setActiveRecipeView: (view: RecipeViewId) => void
  setActiveTab: (tab: AppTabId) => void
  loadBackendState: () => Promise<void>
  resetBackendState: () => void

  items: InventoryItem[]
  recipes: RecipeCard[]
  recipeConsumeReviewMessage: string | null
  selectedIngredientIds: string[]

  lensCandidates: LensCandidate[]
  setLensCandidates: (candidates: LensCandidate[]) => void
  addLensCandidate: (candidate: Omit<LensCandidate, 'id'>) => void
  removeLensCandidate: (id: string) => void
  updateLensCandidate: (id: string, updated: Partial<Omit<LensCandidate, 'id'>>) => void
  clearLensCandidates: () => void

  addItem: (item: Omit<InventoryItem, 'id'>) => StoreActionResult
  addItemsBatch: (newItems: Omit<InventoryItem, 'id'>[]) => StoreActionResult
  removeItem: (id: string) => StoreActionResult
  updateItem: (id: string, updated: Partial<Omit<InventoryItem, 'id'>>) => StoreActionResult
  consumeRecipe: (recipeId: string) => StoreActionResult
  toggleSaveRecipe: (recipeId: string) => StoreActionResult
  setSelectedIngredientIds: (ids: string[]) => StoreActionResult
  toggleSelectedIngredientId: (id: string) => StoreActionResult
}

export const usePrototypeStore = create<PrototypeState>()((set, get) => {
  const setBackendError = (error: unknown) => {
    const message = error instanceof Error ? error.message : '백엔드 요청에 실패했습니다.'
    set({ backendError: message })
    if (import.meta.env.DEV) {
      console.warn('Backend request failed:', error)
    }
  }

  const runBackendMutation = async (operation: () => Promise<void>): StoreActionResult => {
    if (!shouldUseBackendApi()) {
      return false
    }

    set({ backendError: null })
    try {
      await operation()
      return true
    } catch (error) {
      setBackendError(error)
      return false
    }
  }

  const consumeRecipeLocally = (recipeId: string) => {
    set({ recipeConsumeReviewMessage: null })
    set((state) => {
      const recipe = state.recipes.find((r) => r.id === recipeId)
      if (!recipe) return {}

      const recipeIngredients = recipe.ingredients.map((i) => i.name.toLowerCase())
      const updatedItems = state.items
        .map((item) => {
          const nameLower = item.name.toLowerCase()
          const isUsed = recipeIngredients.some(
            (ingredientName) => nameLower.includes(ingredientName) || ingredientName.includes(nameLower),
          )

          if (!isUsed) return item

          const nextQuantity = reduceQuantityLabel(item.quantity)
          return nextQuantity ? { ...item, quantity: nextQuantity } : null
        })
        .filter((item): item is InventoryItem => item !== null)

      const updatedItemIds = new Set(updatedItems.map((item) => item.id))
      return {
        items: updatedItems,
        selectedIngredientIds: state.selectedIngredientIds.filter((id) => updatedItemIds.has(id)),
      }
    })
  }

  return {
    activeHomeState: 'default',
    activeInventoryView: 'list',
    activeLensStep: 'camera',
    activeRecipeView: 'main',
    activeTab: 'home',
    backendError: null,
    backendStatus: 'idle',
    setActiveHomeState: (activeHomeState) => set({ activeHomeState }),
    setActiveInventoryView: (activeInventoryView) => set({ activeInventoryView }),
    setActiveLensStep: (activeLensStep) => set({ activeLensStep }),
    setActiveRecipeView: (activeRecipeView) => set({ activeRecipeView }),
    setActiveTab: (activeTab) => set({ activeTab }),
    resetBackendState: () => set({
      backendError: null,
      backendStatus: 'idle',
      items: [],
      recipes: [],
      recipeConsumeReviewMessage: null,
      selectedIngredientIds: [],
    }),
    loadBackendState: async () => {
      if (!shouldUseBackendApi()) {
        set({
          backendError: null,
          backendStatus: 'ready',
          items: initialItems,
          recipes: initialRecipes,
          selectedIngredientIds: [],
        })
        return
      }

      set({ backendError: null, backendStatus: 'loading' })
      try {
        await importLegacyPrototypeStoreState()
        const [items, selectedIngredientIds] = await Promise.all([
          fetchInventoryItems(),
          fetchInventorySelection(),
        ])
        const itemIds = new Set(items.map((item) => item.id))
        const validSelectedIds = selectedIngredientIds.filter((id) => itemIds.has(id))
        set({
          backendStatus: 'ready',
          items,
          selectedIngredientIds: validSelectedIds,
        })
        void fetchRecipes(validSelectedIds)
          .then((recipes) => {
            if (hasSameStringOrder(get().selectedIngredientIds, validSelectedIds)) {
              set({ recipes })
            }
          })
          .catch(setBackendError)
      } catch (error) {
        set({ backendStatus: 'error' })
        setBackendError(error)
      }
    },

    items: [],
    recipes: [],
    recipeConsumeReviewMessage: null,
    selectedIngredientIds: [],

    lensCandidates: initialCandidates,
    setLensCandidates: (lensCandidates) => set({ lensCandidates }),
    addLensCandidate: (candidate) =>
      set((state) => ({
        lensCandidates: [
          { ...candidate, id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` },
          ...state.lensCandidates,
        ],
      })),
    removeLensCandidate: (id) =>
      set((state) => ({
        lensCandidates: state.lensCandidates.filter((candidate) => candidate.id !== id),
      })),
    updateLensCandidate: (id, updated) =>
      set((state) => ({
        lensCandidates: state.lensCandidates.map((candidate) =>
          candidate.id === id ? { ...candidate, ...updated } : candidate,
        ),
      })),
    clearLensCandidates: () => set({ lensCandidates: [] }),

    addItem: (item) => {
      if (!shouldUseBackendApi()) {
        set((state) => ({ items: [...state.items, { ...item, id: createItemId('single') }] }))
        return Promise.resolve(true)
      }

      return runBackendMutation(async () => {
        const created = await createInventoryItem(item)
        set((state) => ({ items: [...state.items, created] }))
      })
    },

    addItemsBatch: (newItems) => {
      if (!shouldUseBackendApi()) {
        const formattedItems = newItems.map((item, index) => ({
          ...item,
          id: createItemId(`batch_${index}`),
        }))
        set((state) => ({ items: [...state.items, ...formattedItems] }))
        return Promise.resolve(true)
      }

      return runBackendMutation(async () => {
        const createdItems = await createInventoryItemsBatch(
          newItems.map((item, index) => ({
            ...item,
            clientRequestId: createItemId(`batch_${index}`),
          })),
        )
        set((state) => ({ items: [...state.items, ...createdItems] }))
      })
    },

    removeItem: (id) => {
      if (!shouldUseBackendApi()) {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          selectedIngredientIds: state.selectedIngredientIds.filter((selectedId) => selectedId !== id),
        }))
        return Promise.resolve(true)
      }

      return runBackendMutation(async () => {
        await deleteInventoryItem(id)
        const nextSelectedIds = get().selectedIngredientIds.filter((selectedId) => selectedId !== id)
        const recipes = await fetchRecipes(nextSelectedIds)
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          recipes,
          selectedIngredientIds: nextSelectedIds,
        }))
      })
    },

    updateItem: (id, updated) => {
      if (!shouldUseBackendApi()) {
        set((state) => ({
          items: state.items.map((item) => item.id === id ? { ...item, ...updated } : item),
        }))
        return Promise.resolve(true)
      }

      return runBackendMutation(async () => {
        const nextItem = await updateInventoryItem(id, updated)
        set((state) => ({
          items: state.items.map((item) => item.id === id ? nextItem : item),
        }))
      })
    },

    consumeRecipe: (recipeId) => {
      if (!shouldUseBackendApi()) {
        consumeRecipeLocally(recipeId)
        return Promise.resolve(true)
      }

      return runBackendMutation(async () => {
        const result = await consumeRecipeOnBackend(recipeId, get().selectedIngredientIds)
        const removedIds = new Set(result.removedItemIds)
        const updatedById = new Map(result.updatedItems.map((item) => [item.id, item]))
        const updatedItems = get().items
          .filter((item) => !removedIds.has(item.id))
          .map((item) => updatedById.get(item.id) ?? item)
        const existingIds = new Set(updatedItems.map((item) => item.id))
        for (const item of result.updatedItems) {
          if (!existingIds.has(item.id)) updatedItems.push(item)
        }
        set({
          items: updatedItems,
          recipeConsumeReviewMessage: result.needsReview?.length
            ? `재료 차감 검토가 필요한 항목 ${result.needsReview.length}개가 있습니다.`
            : null,
          selectedIngredientIds: result.selectedIngredientIds,
        })
      })
    },

    toggleSaveRecipe: (recipeId) => {
      if (!shouldUseBackendApi()) {
        const nextSaved = !get().recipes.find((recipe) => recipe.id === recipeId)?.saved
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === recipeId ? { ...recipe, saved: nextSaved } : recipe,
          ),
        }))
        return Promise.resolve(true)
      }

      return runBackendMutation(async () => {
        const nextSaved = !get().recipes.find((recipe) => recipe.id === recipeId)?.saved
        const recipe = await saveRecipe(recipeId, nextSaved)
        set((state) => ({
          recipes: state.recipes.map((existing) => existing.id === recipeId ? recipe : existing),
        }))
      })
    },

    setSelectedIngredientIds: (selectedIngredientIds) => {
      if (!shouldUseBackendApi()) {
        set({ selectedIngredientIds })
        return Promise.resolve(true)
      }

      return runBackendMutation(async () => {
        const savedIds = await saveInventorySelection(selectedIngredientIds)
        const recipes = await fetchRecipes(savedIds)
        set({ recipes, selectedIngredientIds: savedIds })
      })
    },

    toggleSelectedIngredientId: (id) => {
      const state = get()
      const isSelected = state.selectedIngredientIds.includes(id)
      const nextIds = isSelected
        ? state.selectedIngredientIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIngredientIds, id]
      return get().setSelectedIngredientIds(nextIds)
    },
  }
})

function readLegacyPrototypeStoreState(): PersistedPrototypeState | null {
  const storage = getBrowserStorage()
  if (!storage) return null

  const rawValue = storage.getItem(legacyPrototypeStoreKey)
  if (!rawValue) return null

  try {
    const parsed: unknown = JSON.parse(rawValue)
    if (!isRecord(parsed) || !isRecord(parsed.state)) return null
    if (!hasPrototypeStateFields(parsed.state)) return null
    return migratePersistedState(parsed.state)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to parse legacy prototype store:', error)
    }
    return null
  }
}

async function importLegacyPrototypeStoreState(): Promise<void> {
  const storage = getBrowserStorage()
  const state = readLegacyPrototypeStoreState()
  if (!storage || !state) return

  await importPrototypeState(state)
  storage.removeItem(legacyPrototypeStoreKey)
}

function hasPrototypeStateFields(value: Record<string, unknown>): boolean {
  return (
    Array.isArray(value.items) ||
    Array.isArray(value.recipes) ||
    Array.isArray(value.selectedIngredientIds)
  )
}

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}
