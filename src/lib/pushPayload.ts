export type PushPayload = {
  body?: string
  icon?: string
  tag?: string
  title?: string
  url?: string
}

export function normalizePushPayload(value: unknown, origin: string): PushPayload {
  if (!isRecord(value)) return {}

  return {
    body: getStringValue(value.body),
    icon: getSafeAssetPath(value.icon, origin),
    tag: getStringValue(value.tag),
    title: getStringValue(value.title),
    url: getSafeClientPath(value.url, origin),
  }
}

export function getNotificationClientPath(value: unknown, origin: string) {
  if (!isRecord(value)) return undefined

  return getSafeClientPath(value.url, origin)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getStringValue(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function getSafeAssetPath(value: unknown, origin: string) {
  return getSameOriginUrl(value, origin)?.pathname
}

function getSafeClientPath(value: unknown, origin: string) {
  const url = getSameOriginUrl(value, origin)
  return url ? `${url.pathname}${url.search}${url.hash}` : undefined
}

function getSameOriginUrl(value: unknown, origin: string) {
  const stringValue = getStringValue(value)
  if (!stringValue) return undefined

  try {
    const url = new URL(stringValue, origin)
    return url.origin === origin ? url : undefined
  } catch {
    return undefined
  }
}
