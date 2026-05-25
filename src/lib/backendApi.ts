import type { InventoryItem, RecipeCard } from '../domain/prototype'
import type { LensCandidate } from '../stores/usePrototypeStore'
import { apiFetch, apiJson } from './apiClient'
import { isClerkConfigured } from './clerk'

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
  duplicateSuggestions?: DuplicateSuggestionDto[]
  idMap?: Record<string, string>
  items: InventoryItemDto[]
}

export type DuplicateSuggestionDto = {
  candidateName: string
  confidence: number
  existingItemId: string
  existingName: string
  reason: 'same_name' | 'similar_name' | 'same_normalized_name'
  recommendation?: string
}

export type InventoryMergeCandidateDto = Omit<InventoryItem, 'id'> & {
  candidateId?: string
}

export type InventoryMergePreviewDto = {
  candidates: InventoryMergeCandidateDto[]
  duplicateSuggestions: DuplicateSuggestionDto[]
  mergeGroups: Array<{
    candidateName: string
    existingItemId: string
    existingName: string
    recommendation: string
    suggestedExpiresAt: string
    suggestedQuantity: string
  }>
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
  reasons?: string[]
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
  provider?: {
    latencyMs?: number
    model?: string
    name: string
  }
  source: 'camera' | 'upload' | 'simulator' | 'natural_text'
  status: 'completed' | 'needs_review'
}

export type LensImageMode = 'fridge' | 'receipt'

type PushSubscriptionRecordDto = {
  id: string
  active: boolean
}

export type PushTestResultDto = {
  queued: true
  sent: number
  failed: number
  inactiveIds: string[]
}

export type PrototypeImportState = {
  items: InventoryItem[]
  recipes: RecipeCard[]
  selectedIngredientIds: string[]
}

type PrototypeImportResultDto = {
  imported: {
    items: number
    recipes: number
    selectedIngredientIds: number
  }
  idMap: {
    items: Record<string, string>
    recipes: Record<string, string>
  }
  skipped: Array<{
    clientId?: string
    reason: string
    type: 'item' | 'recipe' | 'selection'
  }>
}

export type ClientThemePreference = 'light' | 'dark' | 'system'

type ClientPreferenceDto = {
  onboardingCompleted?: boolean
  onboardingCompletedAt?: string | null
  theme?: ClientThemePreference
}

type PushSubscriptionPayload = {
  endpoint: string
  expirationTime: number | null
  keys: {
    auth: string
    p256dh: string
  }
}

type VapidPublicKeyDto = {
  publicKey: string
}

export type NotificationPreferenceDto = {
  expiryReminderDaysBefore: number[]
  expiryReminderEnabled: boolean
  expiryReminderTime: string
  quietHours?: { end: string; start: string }
  recipeConsumeReminderEnabled: boolean
  recommendationReason: string
  recommendedTime: string
  reviewPendingReminderEnabled: boolean
}

export type NotificationPreviewDto = {
  generatedAt: string
  items: Array<{
    bucket: 'today' | 'overdue' | 'soon'
    daysLeft: number
    expiresAt: string
    id: string
    name: string
  }>
  nextNotifications: Array<{
    body: string
    scheduledLocalTime: string
    tag: string
    title: string
    type: 'expiry_reminder' | 'expiry_overdue' | 'today_summary' | 'review_pending'
    url: string
  }>
  recommendedTime: string
  summary: {
    body: string
    needsReviewCount: number
    overdueCount: number
    soonCount: number
    title: string
    todayCount: number
  }
}

export type NotificationDispatchResultDto = {
  dryRun: boolean
  failed: number
  inactiveIds: string[]
  payloads: Array<{ body?: string; tag?: string; title?: string; url?: string }>
  queued: true
  sent: number
}

export type SpoilageRiskDto = {
  daysLeft: number
  level: 'low' | 'medium' | 'high' | 'critical'
  reasons: string[]
  recommendation: string
  score: number
}

export type SpoilageWeatherContextDto = {
  freshnessWindowAdjustmentDays: number
  locationLabel: string
  observedAt: string
  recommendation: string
  relativeHumidity: number
  riskLevel: 'normal' | 'elevated' | 'high'
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  source: 'open_meteo' | 'seasonal_fallback'
  temperatureC: number
}

export type InventorySpoilageRiskReportDto = {
  generatedAt: string
  items: Array<{
    item: InventoryItem
    spoilageRisk: SpoilageRiskDto
    weatherImpact: {
      adjustedDaysLeft: number
      reasons: string[]
      recommendation: string
      scoreDelta: number
    }
  }>
  summary: {
    body: string
    criticalRiskCount: number
    highRiskCount: number
    title: string
    totalItemsCount: number
    weatherRiskLevel: SpoilageWeatherContextDto['riskLevel']
  }
  weather: SpoilageWeatherContextDto
}

export type SpoilageRiskDispatchResultDto = NotificationDispatchResultDto & {
  householdsNotified: number
  householdsScanned: number
}

export type RecipePreferenceDto = {
  allergies: string[]
  dislikedFoods: string[]
  excludedIngredients: string[]
  mildFlavorPreferred?: boolean
  preferredCookTimeMinutes?: number
  recentMeals: Array<{
    consumedAt: string
    id: string
    recipeId: string
    recipeName: string
  }>
}

export type RecipePreferenceUpdateDto = Partial<{
  allergies: string[]
  dislikedFoods: string[]
  excludedIngredients: string[]
  mildFlavorPreferred: boolean | null
  preferredCookTimeMinutes: number | null
}>

export type RecipeFeedbackAction = 'cooked' | 'not_today' | 'disliked'

const jsonHeaders = { 'Content-Type': 'application/json' }

export function canUseBackendApi({
  allowAnonymousBackend = import.meta.env.VITE_ALLOW_ANONYMOUS_BACKEND === 'true',
  clerkConfigured = isClerkConfigured,
  hasFetch = typeof fetch === 'function',
  mode = import.meta.env.MODE,
}: {
  allowAnonymousBackend?: boolean
  clerkConfigured?: boolean
  hasFetch?: boolean
  mode?: string
} = {}): boolean {
  const anonymousBackendAllowed = allowAnonymousBackend && mode !== 'production'
  return (clerkConfigured || anonymousBackendAllowed) && mode !== 'test' && hasFetch
}

export function shouldUseBackendApi(): boolean {
  return canUseBackendApi()
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
  const sanitizedItems = items.map((item) => ({
    clientRequestId: item.clientRequestId,
    expiresAt: item.expiresAt,
    location: item.location,
    name: item.name,
    quantity: item.quantity,
  }))
  const result = await apiJson('/api/v1/inventory/batch', {
    body: JSON.stringify({ items: sanitizedItems, source }),
    headers: withIdempotencyHeaders(idempotencyKey),
    method: 'POST',
  }) as InventoryBatchResultDto

  if (result.duplicateSuggestions?.length && import.meta.env.DEV) {
    console.warn('Backend reported possible duplicate inventory candidates:', result.duplicateSuggestions)
  }

  return result.items.map(toInventoryItem)
}

export async function previewInventoryMergeCandidates(
  candidates: InventoryMergeCandidateDto[],
): Promise<InventoryMergePreviewDto> {
  return await apiJson('/api/v1/inventory/merge-candidates', {
    body: JSON.stringify({ candidates }),
    headers: jsonHeaders,
    method: 'POST',
  }) as InventoryMergePreviewDto
}

export async function fetchInventorySpoilageRisks(): Promise<InventorySpoilageRiskReportDto> {
  return await apiJson('/api/v1/inventory/spoilage-risks') as InventorySpoilageRiskReportDto
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

export async function updateInventoryReviewState(
  itemId: string,
  reviewState: 'needs_review' | 'confirmed',
  reasons: LensCandidate['reviewReasons'] = [],
): Promise<InventoryItem> {
  const updated = await apiJson(`/api/v1/inventory/${encodeURIComponent(itemId)}/review-state`, {
    body: JSON.stringify({ reviewState, reasons }),
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
  const page = await apiJson(`/api/v1/recipes/recommendations?${params.toString()}`) as PageDto<RecipeRecommendationDto>
  return page.data.map(({ recipe, reasons }) => toRecipeCard(recipe, reasons))
}

export async function saveRecipe(recipeId: string, saved: boolean): Promise<RecipeCard> {
  const recipe = await apiJson(`/api/v1/recipes/${encodeURIComponent(recipeId)}/saved`, {
    body: JSON.stringify({ saved }),
    headers: jsonHeaders,
    method: 'PUT',
  }) as RecipeDto
  return toRecipeCard(recipe)
}

export async function sendRecipeFeedback(
  recipeId: string,
  action: RecipeFeedbackAction,
  ingredientNames: string[] = [],
): Promise<void> {
  await apiJson(`/api/v1/recipes/${encodeURIComponent(recipeId)}/feedback`, {
    body: JSON.stringify({ action, ingredientNames }),
    headers: withIdempotencyHeaders(createClientRequestId(`recipe-feedback-${recipeId}-${action}`)),
    method: 'POST',
  })
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
  metadata: { maxCandidates?: number; mode?: LensImageMode; source?: 'camera' | 'upload' | 'simulator' } = {},
): Promise<LensAnalyzeResponseDto> {
  const body = new FormData()
  body.set('image', image)
  body.set('metadata', JSON.stringify({
    maxCandidates: metadata.maxCandidates ?? 3,
    source: metadata.source ?? 'upload',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }))

  const path = metadata.mode ? `/api/v1/lens/${metadata.mode}` : '/api/v1/lens/analyze-image'
  return await apiJson(path, {
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

export async function fetchVapidPublicKey(): Promise<string> {
  const result = await apiJson('/api/v1/push/vapid-public-key') as VapidPublicKeyDto
  return result.publicKey.trim()
}

export async function sendBackendTestPush(): Promise<PushTestResultDto> {
  return await apiJson('/api/v1/push/test', {
    body: JSON.stringify({}),
    headers: withIdempotencyHeaders(createClientRequestId('push-test')),
    method: 'POST',
  }) as PushTestResultDto
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferenceDto> {
  return await apiJson('/api/v1/notifications/preferences') as NotificationPreferenceDto
}

export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferenceDto>,
): Promise<NotificationPreferenceDto> {
  return await apiJson('/api/v1/notifications/preferences', {
    body: JSON.stringify(preferences),
    headers: jsonHeaders,
    method: 'PUT',
  }) as NotificationPreferenceDto
}

export async function fetchNotificationPreview(): Promise<NotificationPreviewDto> {
  return await apiJson('/api/v1/notifications/preview') as NotificationPreviewDto
}

export async function sendDueNotifications(dryRun = false): Promise<NotificationDispatchResultDto> {
  return await apiJson('/api/v1/notifications/send-due', {
    body: JSON.stringify({ dryRun }),
    headers: withIdempotencyHeaders(createClientRequestId('notification-send-due')),
    method: 'POST',
  }) as NotificationDispatchResultDto
}

export async function sendSpoilageRiskNotifications(dryRun = false): Promise<SpoilageRiskDispatchResultDto> {
  return await apiJson('/api/v1/notifications/send-spoilage-risk', {
    body: JSON.stringify({ dryRun }),
    headers: withIdempotencyHeaders(createClientRequestId('notification-spoilage-risk')),
    method: 'POST',
  }) as SpoilageRiskDispatchResultDto
}

export async function importPrototypeState(
  state: PrototypeImportState,
  strategy: 'merge' | 'replace_if_empty' | 'dry_run' = 'replace_if_empty',
): Promise<PrototypeImportResultDto> {
  const idempotencyKey = createStableClientRequestId('prototype-import', state)
  return await apiJson('/api/v1/sync/import-prototype-state', {
    body: JSON.stringify({
      clientGeneratedAt: new Date().toISOString(),
      source: 'prototype-store',
      state: {
        version: 2,
        items: state.items,
        recipes: state.recipes,
        selectedIngredientIds: state.selectedIngredientIds,
      },
      strategy,
    }),
    headers: withIdempotencyHeaders(idempotencyKey),
    method: 'POST',
  }) as PrototypeImportResultDto
}

export async function updateClientPreferences(
  preferences: ClientPreferenceDto,
): Promise<ClientPreferenceDto> {
  return await apiJson('/api/v1/me/client-preferences', {
    body: JSON.stringify(preferences),
    headers: jsonHeaders,
    method: 'PATCH',
  }) as ClientPreferenceDto
}

export async function fetchRecipePreferences(): Promise<RecipePreferenceDto> {
  return await apiJson('/api/v1/me/recipe-preferences') as RecipePreferenceDto
}

export async function updateRecipePreferences(
  preferences: RecipePreferenceUpdateDto,
): Promise<RecipePreferenceDto> {
  return await apiJson('/api/v1/me/recipe-preferences', {
    body: JSON.stringify(preferences),
    headers: jsonHeaders,
    method: 'PUT',
  }) as RecipePreferenceDto
}

function createClientRequestId(scope: string): string {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${scope}-${randomPart}`
}

function createStableClientRequestId(scope: string, value: unknown): string {
  return `${scope}-${hashStableJson(value)}`
}

function hashStableJson(value: unknown): string {
  const input = JSON.stringify(sortJson(value))
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJson)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entryValue]) => [key, sortJson(entryValue)]),
    )
  }
  return value
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

function toRecipeCard(recipe: RecipeDto, recommendationReasons: string[] = []): RecipeCard {
  return {
    id: recipe.id,
    ingredients: recipe.ingredients,
    name: recipe.name,
    recommendationReasons,
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
