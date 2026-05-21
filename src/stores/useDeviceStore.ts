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
  cameraMessage: '식판 또는 냉장고를 촬영해 분석 대기열에 올림',
  cameraStatus: 'idle',
  notificationMessage: '잔반 리뷰와 유통기한 알림 설정 대기',
  notificationStatus: 'idle',
  serviceWorkerMessage: '오프라인/푸시 서비스 준비 전',
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
