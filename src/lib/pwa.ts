import { registerSW } from 'virtual:pwa-register'

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
      message: 'Push notifications require HTTPS or localhost.',
      status: 'unsupported',
    }
  }

  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    return {
      message: 'Notification permission was not granted.',
      status: 'blocked',
    }
  }

  const registration = await getServiceWorkerRegistration()
  const existingSubscription = await registration.pushManager.getSubscription()

  if (existingSubscription) {
    return {
      message: 'Push subscription is already ready.',
      status: 'subscribed',
      subscription: existingSubscription.toJSON(),
    }
  }

  if (!vapidPublicKey.trim()) {
    return {
      message: 'Notification permission is ready. Add VITE_VAPID_PUBLIC_KEY to create a push subscription.',
      status: 'missing-vapid-key',
    }
  }

  const subscription = await registration.pushManager.subscribe({
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    userVisibleOnly: true,
  })

  return {
    message: 'Push subscription is ready.',
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

  await registration.showNotification('Bunruntime is ready', {
    badge: '/pwa-192.png',
    body: 'Service worker notification path is working.',
    data: { url: '/' },
    icon: '/pwa-192.png',
    tag: 'bunruntime-local-test',
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
