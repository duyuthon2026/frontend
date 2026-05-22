/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import {
  getNotificationClientPath,
  normalizePushPayload,
  type PushPayload,
} from './lib/pushPayload'

type PrecacheManifestEntry = {
  revision: string | null
  url: string
}

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: PrecacheManifestEntry[]
}

const sw = self

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
void sw.skipWaiting()
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

  const targetPath = getNotificationClientPath(event.notification.data, sw.location.origin)
  const targetUrl = new URL(targetPath || '/', sw.location.origin).href

  event.waitUntil(openOrFocusClient(targetUrl))
})

function parsePushPayload(data: PushMessageData | null): PushPayload {
  if (!data) {
    return {}
  }

  try {
    return normalizePushPayload(data.json(), sw.location.origin)
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
