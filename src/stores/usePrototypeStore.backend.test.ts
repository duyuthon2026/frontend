import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { InventoryItem, RecipeCard } from '../domain/prototype'

const backendMocks = vi.hoisted(() => ({
  consumeRecipeOnBackend: vi.fn(),
  createInventoryItem: vi.fn(),
  createInventoryItemsBatch: vi.fn(),
  deleteInventoryItem: vi.fn(),
  fetchInventoryItems: vi.fn(),
  fetchInventorySelection: vi.fn(),
  fetchRecipes: vi.fn(),
  importPrototypeState: vi.fn(),
  saveInventorySelection: vi.fn(),
  saveRecipe: vi.fn(),
  shouldUseBackendApi: vi.fn(),
  updateInventoryItem: vi.fn(),
}))

vi.mock('../lib/backendApi', () => backendMocks)

import { usePrototypeStore } from './usePrototypeStore'

const tomatoItem: InventoryItem = {
  id: 'tomato',
  name: '토마토',
  quantity: '2개',
  location: '냉장',
  expiresAt: '2026-05-28',
}

const tofuItem: InventoryItem = {
  id: 'tofu',
  name: '두부',
  quantity: '1모',
  location: '냉장',
  expiresAt: '2026-05-27',
}

const tomatoRecipe: RecipeCard = {
  id: 'tomato-recipe',
  name: '토마토 소진 볶음',
  ingredients: [{ name: '토마토', quantity: '2개', avatar: 'restaurant' }],
  saved: false,
  time: '14분',
}

describe('usePrototypeStore backend recipe refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    backendMocks.shouldUseBackendApi.mockReturnValue(true)
    backendMocks.fetchRecipes.mockResolvedValue([tomatoRecipe])
    usePrototypeStore.setState({
      backendAuthRequired: false,
      backendError: null,
      backendStatus: 'ready',
      items: [],
      recipes: [],
      selectedIngredientIds: [],
    })
  })

  it('refreshes recipes after a backend inventory item is created', async () => {
    backendMocks.createInventoryItem.mockResolvedValue(tomatoItem)

    const saved = await usePrototypeStore.getState().addItem({
      name: '토마토',
      quantity: '2개',
      location: '냉장',
      expiresAt: '2026-05-28',
    })

    expect(saved).toBe(true)
    expect(backendMocks.fetchRecipes).toHaveBeenCalledWith([])
    expect(usePrototypeStore.getState().items).toEqual([tomatoItem])
    expect(usePrototypeStore.getState().recipes).toEqual([tomatoRecipe])
  })

  it('keeps the current recipe access scope when batch inventory is created', async () => {
    backendMocks.createInventoryItemsBatch.mockResolvedValue([tomatoItem])
    usePrototypeStore.setState({
      items: [tofuItem],
      selectedIngredientIds: ['tofu'],
    })

    const saved = await usePrototypeStore.getState().addItemsBatch([{
      name: '토마토',
      quantity: '2개',
      location: '냉장',
      expiresAt: '2026-05-28',
    }])

    expect(saved).toBe(true)
    expect(backendMocks.fetchRecipes).toHaveBeenCalledWith(['tofu'])
    expect(usePrototypeStore.getState().items).toEqual([tofuItem, tomatoItem])
    expect(usePrototypeStore.getState().recipes).toEqual([tomatoRecipe])
  })
})
