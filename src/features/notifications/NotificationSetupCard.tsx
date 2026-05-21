import { useEffect, useMemo, useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { StatusPill } from '../../components/ui/StatusPill'
import {
  getAppServiceWorkerReadiness,
  setupPushNotifications,
  showLocalTestNotification,
} from '../../lib/pwa'
import { useDeviceStore } from '../../stores/useDeviceStore'

export function NotificationSetupCard() {
  const [isTestingNotification, setIsTestingNotification] = useState(false)
  const {
    notificationMessage,
    notificationStatus,
    serviceWorkerMessage,
    serviceWorkerStatus,
    setNotificationState,
    setServiceWorkerState,
  } = useDeviceStore()

  const vapidConfigured = useMemo(
    () => Boolean(import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim()),
    [],
  )
  const canSendTestNotification =
    typeof Notification !== 'undefined' && Notification.permission === 'granted'

  useEffect(() => {
    const serviceWorker = getAppServiceWorkerReadiness()

    if (!serviceWorker.supported) {
      setServiceWorkerState('unsupported', '서비스 워커 미지원')
      return
    }

    setServiceWorkerState('checking', '서비스 워커 등록 중')
    serviceWorker.ready
      .then(() => {
        setServiceWorkerState('ready', '서비스 워커 준비 완료')
      })
      .catch((error) => {
        setServiceWorkerState(
          'error',
          error instanceof Error ? error.message : '서비스 워커 등록 실패',
        )
      })
  }, [setServiceWorkerState])

  const handleEnablePush = async () => {
    setNotificationState('checking', '알림 권한 요청 중')

    try {
      const result = await setupPushNotifications(
        import.meta.env.VITE_VAPID_PUBLIC_KEY,
      )

      if (result.status === 'blocked') {
        setNotificationState('blocked', result.message)
        return
      }

      if (result.status === 'unsupported') {
        setNotificationState('unsupported', result.message)
        return
      }

      if (result.status === 'missing-vapid-key') {
        setNotificationState('error', result.message)
        return
      }

      if (result.status === 'subscribed') {
        setNotificationState('ready', result.message)
        return
      }

      setNotificationState('error', result.message)
    } catch (error) {
      setNotificationState(
        'error',
        error instanceof Error ? error.message : '푸시 알림 설정 실패',
      )
    }
  }

  const handleTestNotification = async () => {
    setIsTestingNotification(true)

    try {
      await showLocalTestNotification()
      setNotificationState('ready', '테스트 알림 발송 완료')
    } catch (error) {
      setNotificationState(
        'error',
        error instanceof Error ? error.message : '테스트 알림 실패',
      )
    } finally {
      setIsTestingNotification(false)
    }
  }

  return (
    <Panel
      className="gap-4"
      eyebrow="Push"
      title="잔반/보관 알림"
      description={
        <>
          <p>{serviceWorkerMessage}</p>
          <p>{notificationMessage}</p>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2.5" aria-label="플랫폼 상태">
        <StatusPill label="SW" status={serviceWorkerStatus} />
        <StatusPill label="Push" status={notificationStatus} />
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          className="flex min-h-11 items-center justify-center rounded-xl border-0 bg-[var(--color-primary)] px-4 text-[0.84rem] font-extrabold text-[var(--color-on-primary)] shadow-[var(--shadow-glass)] transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={notificationStatus === 'checking'}
          onClick={() => void handleEnablePush()}
        >
          {notificationStatus === 'checking' ? '확인 중' : '알림 켜기'}
        </button>
        <button
          type="button"
          className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-4 text-[0.82rem] font-bold text-[var(--color-content-default)] transition-all hover:border-[var(--color-border-brand)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isTestingNotification || !canSendTestNotification}
          onClick={() => void handleTestNotification()}
        >
          {isTestingNotification ? '발송 중' : '테스트'}
        </button>
      </div>
      {!vapidConfigured && (
        <p className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 py-2 text-[0.76rem] text-[var(--color-content-muted)]">
          서버 푸시는 <code>VITE_VAPID_PUBLIC_KEY</code> 설정 뒤 구독 생성
        </p>
      )}
    </Panel>
  )
}
