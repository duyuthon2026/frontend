import { beforeEach, describe, expect, it } from 'vitest'
import type { InventoryItem, RecipeCard } from '../domain/prototype'
import { migratePersistedState, reduceQuantityLabel, usePrototypeStore } from './usePrototypeStore'

const tofuItem: InventoryItem = {
  id: 'tofu',
  name: '두부',
  quantity: '1모',
  location: '냉장',
  expiresAt: '2026-05-24',
}

const tofuRecipe: RecipeCard = {
  id: 'tofu-recipe',
  name: '두부 구이',
  ingredients: [{ name: '두부', quantity: '1모', avatar: 'restaurant' }],
  saved: false,
  time: '10분',
}

describe('usePrototypeStore helpers and actions', () => {
  beforeEach(() => {
    window.localStorage.clear()
    usePrototypeStore.setState({
      items: [tofuItem],
      recipes: [tofuRecipe],
      selectedIngredientIds: ['tofu'],
      lensCandidates: [],
    })
  })

  it('reduces known quantity labels and removes exhausted single-count items', () => {
    expect(reduceQuantityLabel('200g')).toBe('130g')
    expect(reduceQuantityLabel('1모')).toBeNull()
  })

  it('consumes matching recipe ingredients and clears removed selections', async () => {
    await usePrototypeStore.getState().consumeRecipe('tofu-recipe')

    expect(usePrototypeStore.getState().items).toEqual([])
    expect(usePrototypeStore.getState().selectedIngredientIds).toEqual([])
  })

  it('normalizes invalid persisted item fields during migration', () => {
    const migrated = migratePersistedState({
      items: [
        {
          id: 'bad-date',
          name: '토마토',
          quantity: '',
          location: '상온',
          expiresAt: '2026-02-30',
        },
      ],
      recipes: [tofuRecipe],
      selectedIngredientIds: ['bad-date', 'missing'],
    })

    expect(migrated.items[0]).toMatchObject({
      id: 'bad-date',
      name: '토마토',
      quantity: '1개',
      location: '냉장',
    })
    expect(migrated.items[0]?.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(migrated.selectedIngredientIds).toEqual(['bad-date'])
  })
})
