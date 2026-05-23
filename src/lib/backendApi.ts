import type { InventoryItem, RecipeCard } from '../domain/prototype'
import type { LensCandidate } from '../stores/usePrototypeStore'
import { apiFetch, apiJson } from './apiClient'

type PageDto<T> = {
  data: T[]
  page: {
    hasMore: boolean
    limit: number
    nextCursor: string | null
  }
}

type InventoryItemDto = InventoryItem & {
  status?: 'active' | 'consumed' | 'discarded'
  source?: string
}

type InventoryCreateDto = Omit<InventoryItem, 'id'> & {
  clientRequestId?: string
  source?: 'manual' | 'lens_image' | 'lens_upload' | 'lens_text' | 'migration'
}

type InventoryBatchResultDto = {
  duplicateSuggestions?: Array<{ candidateName: string; existingItemId: string }>
  idMap?: Record<string, string>
  items: InventoryItemDto[]
}

type InventorySelectionDto = {
  selectedIngredientIds: string[]
  updatedAt: string
}

type RecipeDto = RecipeCard & {
  description?: string
  imageUrl?: string
  timeMinutes?: number
}

type RecipeRecommendationDto = {
  recipe: RecipeDto
}

type RecipeConsumeResultDto = {
  needsReview?: Array<{ itemId: string; reason: string }>
  removedItemIds: string[]
  selectedIngredientIds: string[]
  updatedItems: InventoryItemDto[]
}

type LensAnalyzeResponseDto = {
  analysisId: string
  candidates: LensCandidate[]
  source: 'camera' | 'upload' | 'simulator' | 'natural_text'
  status: 'completed' | 'needs_review'
}

type PushSubscriptionRecordDto = {
  id: string
  active: boolean
}

type PushSubscriptionPayload = {
  endpoint: string
  expirationTime: number | null
  keys: {
    auth: string
    p256dh: string
  }
}

const jsonHeaders = { 'Content-Type': 'application/json' }

export function shouldUseBackendApi(): boolean {
  return import.meta.env.MODE !== 'test' && typeof fetch === 'function'
}

export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const page = await apiJson('/api/v1/inventory?limit=100') as PageDto<InventoryItemDto>
  return page.data.map(toInventoryItem)
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  const clientRequestId = createClientRequestId('inventory-single')
  const created = await apiJson('/api/v1/inventory', {
    body: JSON.stringify({ ...item, clientRequestId, source: 'manual' } satisfies InventoryCreateDto),
    headers: withIdempotencyHeaders(clientRequestId),
    method: 'POST',
  }) as InventoryItemDto
  return toInventoryItem(created)
}

export async function createInventoryItemsBatch(
  items: Array<Omit<InventoryItem, 'id'> & { clientRequestId?: string }>,
  source: InventoryCreateDto['source'] = 'lens_text',
): Promise<InventoryItem[]> {
  const idempotencyKey = createClientRequestId('inventory-batch')
  const result = await apiJson('/api/v1/inventory/batch', {
    body: JSON.stringify({ items, source }),
    headers: withIdempotencyHeaders(idempotencyKey),
    method: 'POST',
  }) as InventoryBatchResultDto

  if (result.duplicateSuggestions?.length && import.meta.env.DEV) {
    console.warn('Backend reported possible duplicate inventory candidates:', result.duplicateSuggestions)
  }

  return result.items.map(toInventoryItem)
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
  await apiFetch(`/api/v1/inventory/${encodeURIComponent(itemId)}`, { method: 'DELETE' })
}

export async function updateInventoryItem(
  itemId: string,
  patch: Partial<Omit<InventoryItem, 'id'>>,
): Promise<InventoryItem> {
  const updated = await apiJson(`/api/v1/inventory/${encodeURIComponent(itemId)}`, {
    body: JSON.stringify(patch),
    headers: jsonHeaders,
    method: 'PATCH',
  }) as InventoryItemDto
  return toInventoryItem(updated)
}

export async function fetchInventorySelection(): Promise<string[]> {
  const selection = await apiJson('/api/v1/inventory/selections') as InventorySelectionDto
  return selection.selectedIngredientIds
}

export async function saveInventorySelection(selectedIngredientIds: string[]): Promise<string[]> {
  const selection = await apiJson('/api/v1/inventory/selections', {
    body: JSON.stringify({ selectedIngredientIds }),
    headers: jsonHeaders,
    method: 'PUT',
  }) as InventorySelectionDto
  return selection.selectedIngredientIds
}

export async function fetchRecipes(selectedIngredientIds: string[] = []): Promise<RecipeCard[]> {
  const params = new URLSearchParams({ limit: '100', mode: 'recommend' })
  for (const id of selectedIngredientIds) params.append('selectedIngredientIds', id)
  const page = await apiJson(`/api/v1/recipes?${params.toString()}`) as PageDto<RecipeRecommendationDto>
  return page.data.map(({ recipe }) => toRecipeCard(recipe))
}

export async function saveRecipe(recipeId: string, saved: boolean): Promise<RecipeCard> {
  const recipe = await apiJson(`/api/v1/recipes/${encodeURIComponent(recipeId)}/saved`, {
    body: JSON.stringify({ saved }),
    headers: jsonHeaders,
    method: 'PUT',
  }) as RecipeDto
  return toRecipeCard(recipe)
}

export async function consumeRecipeOnBackend(
  recipeId: string,
  selectedIngredientIds: string[],
): Promise<RecipeConsumeResultDto> {
  return await apiJson(`/api/v1/recipes/${encodeURIComponent(recipeId)}/consume`, {
    body: JSON.stringify({ selectedIngredientIds, strategy: 'frontend_label_compat' }),
    headers: withIdempotencyHeaders(createClientRequestId(`recipe-consume-${recipeId}`)),
    method: 'POST',
  }) as RecipeConsumeResultDto
}

export async function analyzeLensText(text: string): Promise<LensAnalyzeResponseDto> {
  return await apiJson('/api/v1/lens/analyze-text', {
    body: JSON.stringify({ text, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    headers: withIdempotencyHeaders(createClientRequestId('lens-text')),
    method: 'POST',
  }) as LensAnalyzeResponseDto
}

export async function analyzeLensImage(
  image: File,
  metadata: { maxCandidates?: number; source?: 'camera' | 'upload' | 'simulator' } = {},
): Promise<LensAnalyzeResponseDto> {
  const body = new FormData()
  body.set('image', image)
  body.set('metadata', JSON.stringify({
    maxCandidates: metadata.maxCandidates ?? 3,
    source: metadata.source ?? 'upload',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }))

  return await apiJson('/api/v1/lens/analyze-image', {
    body,
    headers: withIdempotencyHeaders(createClientRequestId('lens-image'), false),
    method: 'POST',
  }) as LensAnalyzeResponseDto
}

export async function registerPushSubscription(
  subscription: PushSubscriptionJSON,
): Promise<PushSubscriptionRecordDto | null> {
  const payload = toPushSubscriptionPayload(subscription)
  if (!payload) return null

  return await apiJson('/api/v1/push/subscriptions', {
    body: JSON.stringify({
      subscription: payload,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: navigator.userAgent,
    }),
    headers: withIdempotencyHeaders(createClientRequestId('push-subscription')),
    method: 'POST',
  }) as PushSubscriptionRecordDto
}

export async function sendBackendTestPush(): Promise<void> {
  await apiJson('/api/v1/push/test', {
    body: JSON.stringify({}),
    headers: withIdempotencyHeaders(createClientRequestId('push-test')),
    method: 'POST',
  })
}

function createClientRequestId(scope: string): string {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${scope}-${randomPart}`
}

function withIdempotencyHeaders(idempotencyKey: string, includeJsonContentType = true): HeadersInit {
  const headers = new Headers(includeJsonContentType ? jsonHeaders : undefined)
  headers.set('Idempotency-Key', idempotencyKey)
  return headers
}

function toInventoryItem(item: InventoryItemDto): InventoryItem {
  return {
    expiresAt: item.expiresAt,
    id: item.id,
    location: item.location,
    name: item.name,
    quantity: item.quantity,
  }
}

function toRecipeCard(recipe: RecipeDto): RecipeCard {
  return {
    id: recipe.id,
    ingredients: recipe.ingredients,
    name: recipe.name,
    saved: recipe.saved,
    time: recipe.time,
  }
}

function toPushSubscriptionPayload(subscription: PushSubscriptionJSON): PushSubscriptionPayload | null {
  const endpoint = subscription.endpoint
  const auth = subscription.keys?.auth
  const p256dh = subscription.keys?.p256dh

  if (!endpoint || !auth || !p256dh) return null

  return {
    endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: { auth, p256dh },
  }
}
