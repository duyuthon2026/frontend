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

export type PushPreflightInput = {
  hasNotification: boolean
  hasPushManager: boolean
  isIOS: boolean
  isSecureContext: boolean
  isStandalone: boolean
}

export type PushPreflightResult =
  | {
      canRequest: true
      message: string
    }
  | {
      canRequest: false
      message: string
      status: 'unsupported'
    }

let didRegisterServiceWorker = false
let serviceWorkerReady: Promise<ServiceWorkerRegistration> | null = null
let cachedInstallPromptEvent: BeforeInstallPromptEvent | null = null
let cachedIsInstallable = false

const installPromptSubscribers = new Set<() => void>()

export function registerAppServiceWorker(): ServiceWorkerRegistrationResult {
  if (!('serviceWorker' in navigator)) {
    return {
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
        if (import.meta.env.DEV) {
          console.error('Service worker registration failed:', error)
        }
      },
    })
  }

  serviceWorkerReady ??= navigator.serviceWorker.ready

  return {
    ready: serviceWorkerReady,
    supported: true,
  }
}

export function getAppServiceWorkerReadiness(): ServiceWorkerRegistrationResult {
  if (!('serviceWorker' in navigator)) {
    return {
      supported: false,
    }
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
  const pushPreflight = getBrowserPushPreflight()

  if (!pushPreflight.canRequest) {
    return {
      message: pushPreflight.message,
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
  const trimmedVapidPublicKey = vapidPublicKey.trim()
  const applicationServerKey = trimmedVapidPublicKey
    ? urlBase64ToUint8Array(trimmedVapidPublicKey)
    : null

  if (existingSubscription) {
    if (
      applicationServerKey &&
      !subscriptionUsesApplicationServerKey(existingSubscription, applicationServerKey)
    ) {
      await existingSubscription.unsubscribe()
    } else {
      return {
        message: '푸시 구독이 이미 준비되었습니다.',
        status: 'subscribed',
        subscription: existingSubscription.toJSON(),
      }
    }
  }

  if (!applicationServerKey) {
    return {
      message: '알림 권한 준비 완료. 서버 VAPID 공개키 설정 뒤 푸시 구독 생성.',
      status: 'missing-vapid-key',
    }
  }

  const subscription = await registration.pushManager.subscribe({
    applicationServerKey,
    userVisibleOnly: true,
  })

  return {
    message: existingSubscription ? '푸시 구독 갱신 완료.' : '푸시 구독 준비 완료.',
    status: 'subscribed',
    subscription: subscription.toJSON(),
  }
}

export function getPushPreflight({
  hasNotification,
  hasPushManager,
  isIOS,
  isSecureContext,
  isStandalone,
}: PushPreflightInput): PushPreflightResult {
  if (!isSecureContext) {
    return {
      canRequest: false,
      message: '푸시 알림은 HTTPS 또는 localhost에서 동작합니다.',
      status: 'unsupported',
    }
  }

  if (isIOS && !isStandalone) {
    return {
      canRequest: false,
      message: 'iOS Safari 탭에서는 푸시 구독을 만들 수 없습니다. 공유 버튼에서 홈 화면에 추가한 뒤 홈 화면 아이콘으로 실행해 알림을 켜세요.',
      status: 'unsupported',
    }
  }

  if (!hasNotification || !hasPushManager) {
    return {
      canRequest: false,
      message: isIOS
        ? 'iOS 16.4 이상 홈 화면 앱에서만 Web Push를 지원합니다. iOS 버전과 홈 화면 실행 상태를 확인하세요.'
        : '이 브라우저는 웹 푸시 알림을 지원하지 않습니다.',
      status: 'unsupported',
    }
  }

  return {
    canRequest: true,
    message: '푸시 알림 권한을 요청할 수 있습니다.',
  }
}

export function getBrowserPushPreflight(): PushPreflightResult {
  return getPushPreflight({
    hasNotification: typeof window !== 'undefined' && 'Notification' in window,
    hasPushManager: typeof window !== 'undefined' && 'PushManager' in window,
    isIOS: getIsIOSDevice(),
    isSecureContext: typeof window !== 'undefined' && window.isSecureContext,
    isStandalone: getIsStandaloneMode(),
  })
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

type PushSubscriptionWithOptions = PushSubscription & {
  options?: {
    applicationServerKey?: ArrayBuffer | null
  }
}

function subscriptionUsesApplicationServerKey(
  subscription: PushSubscription,
  expectedKey: Uint8Array<ArrayBuffer>,
): boolean {
  const applicationServerKey = (subscription as PushSubscriptionWithOptions).options
    ?.applicationServerKey

  if (!applicationServerKey) {
    return true
  }

  return byteArraysEqual(new Uint8Array(applicationServerKey), expectedKey)
}

function byteArraysEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) {
    return false
  }

  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) {
      return false
    }
  }

  return true
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
