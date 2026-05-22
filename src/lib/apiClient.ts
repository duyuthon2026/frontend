export type ApiFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export type ApiFetchOptions = RequestInit & {
  authToken?: string
  baseUrl?: string
  fetchImpl?: ApiFetch
}

export class ApiError extends Error {
  readonly body: string
  readonly status: number
  readonly url: string

  constructor(status: number, url: string, body: string) {
    super(`API request failed with ${status}`)
    this.body = body
    this.name = 'ApiError'
    this.status = status
    this.url = url
  }
}

const sameOriginUrlBase = 'https://janban.local'

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

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json')
  }

  if (authToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetchImpl(url, {
    credentials: 'same-origin',
    ...requestInit,
    headers: requestHeaders,
  })

  if (!response.ok) {
    throw new ApiError(response.status, response.url || url, await response.text())
  }

  return response
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
