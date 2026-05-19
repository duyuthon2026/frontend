import { create } from 'zustand'

export type CapabilityStatus =
  | 'idle'
  | 'checking'
  | 'ready'
  | 'active'
  | 'blocked'
  | 'unsupported'
  | 'error'

type DeviceStore = {
  cameraMessage: string
  cameraStatus: CapabilityStatus
  notificationMessage: string
  notificationStatus: CapabilityStatus
  serviceWorkerMessage: string
  serviceWorkerStatus: CapabilityStatus
  setCameraState: (status: CapabilityStatus, message?: string) => void
  setNotificationState: (status: CapabilityStatus, message?: string) => void
  setServiceWorkerState: (status: CapabilityStatus, message?: string) => void
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  cameraMessage: 'Camera not started.',
  cameraStatus: 'idle',
  notificationMessage: 'Push notifications not configured.',
  notificationStatus: 'idle',
  serviceWorkerMessage: 'Service worker not registered.',
  serviceWorkerStatus: 'idle',
  setCameraState: (cameraStatus, cameraMessage = '') =>
    set((state) => ({
      cameraMessage: cameraMessage || state.cameraMessage,
      cameraStatus,
    })),
  setNotificationState: (notificationStatus, notificationMessage = '') =>
    set((state) => ({
      notificationMessage: notificationMessage || state.notificationMessage,
      notificationStatus,
    })),
  setServiceWorkerState: (serviceWorkerStatus, serviceWorkerMessage = '') =>
    set((state) => ({
      serviceWorkerMessage: serviceWorkerMessage || state.serviceWorkerMessage,
      serviceWorkerStatus,
    })),
}))
