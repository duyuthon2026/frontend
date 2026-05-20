/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

type PushPayload = {
  body?: string
  icon?: string
  tag?: string
  title?: string
  url?: string
}

const sw = self as unknown as ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    revision: string | null
    url: string
  }>
}

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
sw.skipWaiting()
clientsClaim()

sw.addEventListener('push', (event) => {
  const payload = parsePushPayload(event.data)
  const title = payload.title || '잔반제로'

  event.waitUntil(
    sw.registration.showNotification(title, {
      badge: '/icon.png',
      body: payload.body || '새 알림이 도착했습니다.',
      data: { url: payload.url || '/' },
      icon: payload.icon || '/icon.png',
      tag: payload.tag || 'janban-zero-push',
    }),
  )
})

sw.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = new URL(
    String(event.notification.data?.url || '/'),
    sw.location.origin,
  ).href

  event.waitUntil(openOrFocusClient(targetUrl))
})

function parsePushPayload(data: PushMessageData | null): PushPayload {
  if (!data) {
    return {}
  }

  try {
    return data.json() as PushPayload
  } catch {
    return {
      body: data.text(),
      title: '잔반제로',
    }
  }
}

async function openOrFocusClient(targetUrl: string): Promise<void> {
  const windowClients = await sw.clients.matchAll({
    includeUncontrolled: true,
    type: 'window',
  })

  const matchingClient = windowClients.find((client) => client.url === targetUrl)

  if (matchingClient) {
    await matchingClient.focus()
    return
  }

  await sw.clients.openWindow(targetUrl)
}
