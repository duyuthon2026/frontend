import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { brand } from '../config/brand'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

type StandaloneNavigator = Navigator & {
  standalone?: boolean
}

type ServiceWorkerRegistrationResult =
  | {
      ready: Promise<ServiceWorkerRegistration>
      supported: true
    }
  | {
      ready: Promise<never>
      supported: false
    }

export type PushSetupResult =
  | {
      message: string
      status: 'blocked' | 'missing-vapid-key' | 'subscribed' | 'unsupported'
      subscription?: PushSubscriptionJSON
    }
  | {
      message: string
      status: 'ready'
    }

let didRegisterServiceWorker = false
let serviceWorkerReady: Promise<ServiceWorkerRegistration> | null = null
let cachedInstallPromptEvent: BeforeInstallPromptEvent | null = null
let cachedIsInstallable = false

const installPromptSubscribers = new Set<() => void>()

export function registerAppServiceWorker(): ServiceWorkerRegistrationResult {
  if (!('serviceWorker' in navigator)) {
    return {
      ready: Promise.reject(new Error('Service workers are not supported.')),
      supported: false,
    }
  }

  if (!didRegisterServiceWorker) {
    didRegisterServiceWorker = true
    registerSW({
      immediate: true,
      onRegisteredSW: (_swUrl, registration) => {
        registration?.update().catch(() => undefined)
      },
      onRegisterError: (error) => {
        console.error('Service worker registration failed:', error)
      },
    })
  }

  serviceWorkerReady ??= navigator.serviceWorker.ready

  return {
    ready: serviceWorkerReady,
    supported: true,
  }
}

export async function setupPushNotifications(
  vapidPublicKey = '',
): Promise<PushSetupResult> {
  if (!('Notification' in window) || !('PushManager' in window)) {
    return {
      message: 'This browser does not support web push notifications.',
      status: 'unsupported',
    }
  }

  if (!window.isSecureContext) {
    return {
      message: '푸시 알림은 HTTPS 또는 localhost에서 동작합니다.',
      status: 'unsupported',
    }
  }

  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    return {
      message: '알림 권한이 허용되지 않았습니다.',
      status: 'blocked',
    }
  }

  const registration = await getServiceWorkerRegistration()
  const existingSubscription = await registration.pushManager.getSubscription()

  if (existingSubscription) {
    return {
      message: '푸시 구독이 이미 준비되었습니다.',
      status: 'subscribed',
      subscription: existingSubscription.toJSON(),
    }
  }

  if (!vapidPublicKey.trim()) {
    return {
      message: '알림 권한 준비 완료. VITE_VAPID_PUBLIC_KEY 설정 뒤 푸시 구독 생성.',
      status: 'missing-vapid-key',
    }
  }

  const subscription = await registration.pushManager.subscribe({
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    userVisibleOnly: true,
  })

  return {
    message: '푸시 구독 준비 완료.',
    status: 'subscribed',
    subscription: subscription.toJSON(),
  }
}

export async function showLocalTestNotification(): Promise<void> {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported.')
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission is not granted.')
  }

  const registration = await getServiceWorkerRegistration()

  await registration.showNotification(`${brand.appName} 준비 완료`, {
    badge: brand.appIconPng,
    body: '서비스 워커 알림 경로가 동작합니다.',
    data: { url: '/' },
    icon: brand.appIconPng,
    tag: 'janban-zero-local-test',
  })
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const serviceWorker = registerAppServiceWorker()

  if (!serviceWorker.supported) {
    throw new Error('Service workers are not supported.')
  }

  return serviceWorker.ready
}

function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = `${value}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index)
  }

  return output
}

export function usePWAInstall() {
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(cachedInstallPromptEvent)
  const [isInstallable, setIsInstallable] = useState(cachedIsInstallable)
  const [isStandalone, setIsStandalone] = useState(getIsStandaloneMode)
  const [isIOS] = useState(getIsIOSDevice)

  useEffect(() => {
    const syncCachedPrompt = () => {
      setInstallPromptEvent(cachedInstallPromptEvent)
      setIsInstallable(cachedIsInstallable)
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      if (!isBeforeInstallPromptEvent(event)) return

      event.preventDefault()
      cacheInstallPrompt(event, true)
    }

    const handleAppInstalled = () => {
      cacheInstallPrompt(null, false)
      setIsStandalone(true)
    }

    installPromptSubscribers.add(syncCachedPrompt)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      installPromptSubscribers.delete(syncCachedPrompt)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!installPromptEvent) return false
    await installPromptEvent.prompt()
    const { outcome } = await installPromptEvent.userChoice
    cacheInstallPrompt(null, false)
    return outcome === 'accepted'
  }

  return {
    isInstallable,
    isStandalone,
    isIOS,
    installApp,
  }
}

function cacheInstallPrompt(
  promptEvent: BeforeInstallPromptEvent | null,
  isInstallable: boolean,
) {
  cachedInstallPromptEvent = promptEvent
  cachedIsInstallable = isInstallable
  installPromptSubscribers.forEach((subscriber) => subscriber())
}

function getIsStandaloneMode() {
  if (typeof window === 'undefined') return false

  const standaloneNavigator: StandaloneNavigator = window.navigator

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    standaloneNavigator.standalone === true
  )
}

function getIsIOSDevice() {
  if (typeof window === 'undefined') return false

  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
}

function isBeforeInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  const userChoice =
    'userChoice' in event ? (event as { userChoice?: unknown }).userChoice : undefined

  return (
    'prompt' in event &&
    typeof event.prompt === 'function' &&
    userChoice !== undefined &&
    isPromiseLike(userChoice)
  )
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  if (typeof value !== 'object' || value === null) return false
  if (!('then' in value)) return false

  return typeof value.then === 'function'
}
