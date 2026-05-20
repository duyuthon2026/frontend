import { useEffect, useMemo, useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { StatusPill } from '../../components/ui/StatusPill'
import {
  registerAppServiceWorker,
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
    const serviceWorker = registerAppServiceWorker()

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

      setNotificationState('ready', result.message)
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
      className="notification-panel"
      eyebrow="Push"
      title="잔반/보관 알림"
      description={
        <>
          <p>{serviceWorkerMessage}</p>
          <p>{notificationMessage}</p>
        </>
      }
    >
      <div className="status-grid" aria-label="플랫폼 상태">
        <StatusPill label="SW" status={serviceWorkerStatus} />
        <StatusPill label="Push" status={notificationStatus} />
      </div>
      <div className="action-stack">
        <button
          type="button"
          className="primary-action"
          disabled={notificationStatus === 'checking'}
          onClick={handleEnablePush}
        >
          {notificationStatus === 'checking' ? '확인 중' : '알림 켜기'}
        </button>
        <button
          type="button"
          className="secondary-action"
          disabled={isTestingNotification || !canSendTestNotification}
          onClick={handleTestNotification}
        >
          {isTestingNotification ? '발송 중' : '테스트'}
        </button>
      </div>
      {!vapidConfigured && (
        <p className="setup-note">
          서버 푸시는 <code>VITE_VAPID_PUBLIC_KEY</code> 설정 뒤 구독 생성
        </p>
      )}
    </Panel>
  )
}
