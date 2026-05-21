import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
import { getRelativeDateString, isIsoLocalDateString } from '../lib/date'

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
  id: string
  name: string
  quantity: string
  location: StorageLocation
  expiresAt: string
}

type PersistedPrototypeState = {
  items: InventoryItem[]
  recipes: RecipeCard[]
  selectedIngredientIds: string[]
}

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
        (id): id is string => typeof id === 'string' && itemIds.has(id)
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
  setActiveHomeState: (state: HomeStateId) => void
  setActiveInventoryView: (view: InventoryViewId) => void
  setActiveLensStep: (step: LensStepId) => void
  setActiveRecipeView: (view: RecipeViewId) => void
  setActiveTab: (tab: AppTabId) => void

  items: InventoryItem[]
  recipes: RecipeCard[]
  selectedIngredientIds: string[]

  lensCandidates: LensCandidate[]
  setLensCandidates: (candidates: LensCandidate[]) => void
  addLensCandidate: (candidate: Omit<LensCandidate, 'id'>) => void
  removeLensCandidate: (id: string) => void
  updateLensCandidate: (id: string, updated: Partial<Omit<LensCandidate, 'id'>>) => void
  clearLensCandidates: () => void

  addItem: (item: Omit<InventoryItem, 'id'>) => void
  addItemsBatch: (newItems: Omit<InventoryItem, 'id'>[]) => void
  removeItem: (id: string) => void
  updateItem: (id: string, updated: Partial<Omit<InventoryItem, 'id'>>) => void
  consumeRecipe: (recipeId: string) => void
  toggleSaveRecipe: (recipeId: string) => void
  setSelectedIngredientIds: (ids: string[]) => void
  toggleSelectedIngredientId: (id: string) => void
}

export const usePrototypeStore = create<PrototypeState>()(
  persist<PrototypeState, [], [], PersistedPrototypeState>(
    (set) => ({
      activeHomeState: 'default',
      activeInventoryView: 'list',
      activeLensStep: 'camera',
      activeRecipeView: 'main',
      activeTab: 'home',
      setActiveHomeState: (activeHomeState) => set({ activeHomeState }),
      setActiveInventoryView: (activeInventoryView) => set({ activeInventoryView }),
      setActiveLensStep: (activeLensStep) => set({ activeLensStep }),
      setActiveRecipeView: (activeRecipeView) => set({ activeRecipeView }),
      setActiveTab: (activeTab) => set({ activeTab }),

      items: initialItems,
      recipes: initialRecipes,
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
          lensCandidates: state.lensCandidates.filter((c) => c.id !== id),
        })),
      updateLensCandidate: (id, updated) =>
        set((state) => ({
          lensCandidates: state.lensCandidates.map((c) =>
            c.id === id ? { ...c, ...updated } : c
          ),
        })),
      clearLensCandidates: () => set({ lensCandidates: [] }),

      addItem: (item) =>
        set((state) => {
          const newItem: InventoryItem = {
            ...item,
            id: createItemId('single'),
          }
          return { items: [...state.items, newItem] }
        }),

      addItemsBatch: (newItems) =>
        set((state) => {
          const formattedItems = newItems.map((item, index) => ({
            ...item,
            id: createItemId(`batch_${index}`),
          }))
          return { items: [...state.items, ...formattedItems] }
        }),

      removeItem: (id) =>
        set((state) => {
          const nextItems = state.items.filter((item) => item.id !== id)
          return {
            items: nextItems,
            selectedIngredientIds: state.selectedIngredientIds.filter((sid) => sid !== id),
          }
        }),

      updateItem: (id, updated) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updated } : item
          ),
        })),

      consumeRecipe: (recipeId) =>
        set((state) => {
          const recipe = state.recipes.find((r) => r.id === recipeId)
          if (!recipe) return {}

          const recipeIngredients = recipe.ingredients.map((i) => i.name.toLowerCase())

          const updatedItems = state.items
            .map((item) => {
              const nameLower = item.name.toLowerCase()
              const isUsed = recipeIngredients.some(
                (ing) => nameLower.includes(ing) || ing.includes(nameLower)
              )

              if (isUsed) {
                const nextQuantity = reduceQuantityLabel(item.quantity)
                return nextQuantity ? { ...item, quantity: nextQuantity } : null
              }
              return item
            })
            .filter((item): item is InventoryItem => item !== null)

          const updatedItemIds = new Set(updatedItems.map((item) => item.id))
          const nextSelectedIngredientIds = state.selectedIngredientIds.filter((sid) =>
            updatedItemIds.has(sid)
          )

          return {
            items: updatedItems,
            selectedIngredientIds: nextSelectedIngredientIds,
          }
        }),

      toggleSaveRecipe: (recipeId) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === recipeId ? { ...recipe, saved: !recipe.saved } : recipe
          ),
        })),

      setSelectedIngredientIds: (selectedIngredientIds) => set({ selectedIngredientIds }),
      toggleSelectedIngredientId: (id) =>
        set((state) => {
          const isSelected = state.selectedIngredientIds.includes(id)
          const nextIds = isSelected
            ? state.selectedIngredientIds.filter((sid) => sid !== id)
            : [...state.selectedIngredientIds, id]
          return { selectedIngredientIds: nextIds }
        }),
    }),
    {
      name: 'prototype-store',
      version: 2,
      partialize: (state): PersistedPrototypeState => ({
        items: state.items,
        recipes: state.recipes,
        selectedIngredientIds: state.selectedIngredientIds,
      }),
      migrate: (persistedState) => migratePersistedState(persistedState),
    }
  )
)
