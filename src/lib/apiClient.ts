export type ApiFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export type ApiAuthTokenProvider = () => Promise<string | null | undefined>

export type ApiFetchOptions = RequestInit & {
  authToken?: string
  baseUrl?: string
  fetchImpl?: ApiFetch
}

export const apiUnauthorizedEventName = 'janban-zero:api-unauthorized'

export class ApiError extends Error {
  readonly body: string
  readonly status: number
  readonly url: string

  constructor(status: number, url: string, body: string) {
    super(getApiErrorMessage(status, body))
    this.body = body
    this.name = 'ApiError'
    this.status = status
    this.url = url
  }
}

function getApiErrorMessage(status: number, body: string): string {
  const problemDetail = getProblemDetail(body)
  return problemDetail || `API request failed with ${status}`
}

function getProblemDetail(body: string): string | null {
  try {
    const parsed: unknown = JSON.parse(body)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }
    const record = parsed as Record<string, unknown>
    return typeof record.detail === 'string'
      ? record.detail
      : typeof record.title === 'string'
        ? record.title
        : null
  } catch {
    return null
  }
}

const sameOriginUrlBase = 'https://janban.local'
let apiAuthTokenProvider: ApiAuthTokenProvider | undefined

export function setApiAuthTokenProvider(provider: ApiAuthTokenProvider | undefined): void {
  apiAuthTokenProvider = provider
}

export function addApiUnauthorizedListener(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined

  window.addEventListener(apiUnauthorizedEventName, listener)
  return () => window.removeEventListener(apiUnauthorizedEventName, listener)
}

export function isApiUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401
}

export function getApiBaseUrl(baseUrl = import.meta.env.VITE_API_BASE_URL): string {
  const trimmedBaseUrl = (baseUrl ?? '').trim()

  if (!trimmedBaseUrl) {
    return ''
  }

  let url: URL
  try {
    url = new URL(trimmedBaseUrl)
  } catch {
    throw new Error('API base URL must be an HTTP(S) origin')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('API base URL must use http or https')
  }

  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error('API base URL must be an origin without path, query, or hash')
  }

  return url.origin
}

export function resolveApiUrl(pathname: string, baseUrl = getApiBaseUrl()): string {
  if (!pathname.startsWith('/api/')) {
    throw new Error(`API path must start with /api/: ${pathname}`)
  }

  const apiPathUrl = new URL(pathname, sameOriginUrlBase)
  if (!apiPathUrl.pathname.startsWith('/api/')) {
    throw new Error(`API path must stay under /api/ after URL normalization: ${pathname}`)
  }

  if (apiPathUrl.hash) {
    throw new Error(`API path must not include a URL fragment: ${pathname}`)
  }

  const normalizedApiPath = `${apiPathUrl.pathname}${apiPathUrl.search}`
  const normalizedBaseUrl = getApiBaseUrl(baseUrl)
  return normalizedBaseUrl ? `${normalizedBaseUrl}${normalizedApiPath}` : normalizedApiPath
}

export async function apiFetch(pathname: string, options: ApiFetchOptions = {}): Promise<Response> {
  const {
    authToken,
    baseUrl,
    fetchImpl = fetch,
    headers,
    ...requestInit
  } = options
  const url = resolveApiUrl(pathname, baseUrl)
  const requestHeaders = new Headers(headers)
  const resolvedAuthToken = authToken ?? await apiAuthTokenProvider?.()

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json')
  }

  if (resolvedAuthToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${resolvedAuthToken}`)
  }

  const response = await fetchImpl(url, {
    credentials: 'same-origin',
    ...requestInit,
    headers: requestHeaders,
  })

  if (!response.ok) {
    const error = new ApiError(response.status, response.url || url, await response.text())
    if (error.status === 401) {
      notifyApiUnauthorized()
    }
    throw error
  }

  return response
}

function notifyApiUnauthorized(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(apiUnauthorizedEventName))
}

export async function apiJson(pathname: string, options: ApiFetchOptions = {}): Promise<unknown> {
  const response = await apiFetch(pathname, options)

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const data: unknown = await response.json()
    return data
  }

  return response.text()
}
