import { useEffect, useMemo, useState } from 'react'
import { Panel } from '../../components/ui/Panel'
import { StatusPill } from '../../components/ui/StatusPill'
import {
  getBrowserPushPreflight,
  getAppServiceWorkerReadiness,
  setupPushNotifications,
  showLocalTestNotification,
} from '../../lib/pwa'
import { AccountRequiredCard } from '../auth/AuthSession'
import { useAuthSession } from '../auth/authSessionContext'
import {
  fetchVapidPublicKey,
  registerPushSubscription,
  sendBackendTestPush,
  shouldUseBackendApi,
  type PushTestResultDto,
} from '../../lib/backendApi'
import { useDeviceStore } from '../../stores/useDeviceStore'

export function NotificationSetupCard() {
  const [isTestingNotification, setIsTestingNotification] = useState(false)
  const [isLoadingPushConfig, setIsLoadingPushConfig] = useState(false)
  const [vapidPublicKey, setVapidPublicKey] = useState(
    () => import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim() ?? '',
  )
  const {
    notificationMessage,
    notificationStatus,
    serviceWorkerMessage,
    serviceWorkerStatus,
    setNotificationState,
    setServiceWorkerState,
  } = useDeviceStore()
  const { canUseBackendAccount, requiresAccount } = useAuthSession()
  const pushPreflight = useMemo(() => getBrowserPushPreflight(), [])

  const vapidConfigured = useMemo(() => Boolean(vapidPublicKey.trim()), [vapidPublicKey])
  const canSendTestNotification =
    typeof Notification !== 'undefined' && Notification.permission === 'granted'

  useEffect(() => {
    const envVapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim() ?? ''
    if (!shouldUseBackendApi()) {
      setVapidPublicKey(envVapidPublicKey)
      return undefined
    }

    let isCancelled = false
    setIsLoadingPushConfig(true)
    fetchVapidPublicKey()
      .then((serverVapidPublicKey) => {
        if (isCancelled) return
        setVapidPublicKey(serverVapidPublicKey || envVapidPublicKey)
      })
      .catch(() => {
        if (isCancelled) return
        setVapidPublicKey(envVapidPublicKey)
      })
      .finally(() => {
        if (isCancelled) return
        setIsLoadingPushConfig(false)
      })

    return () => {
      isCancelled = true
    }
  }, [])

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

  useEffect(() => {
    if (pushPreflight.canRequest || notificationStatus !== 'idle') return
    setNotificationState('unsupported', pushPreflight.message)
  }, [notificationStatus, pushPreflight, setNotificationState])

  const handleEnablePush = async () => {
    if (!canUseBackendAccount) return
    setNotificationState('checking', '알림 권한 요청 중')

    try {
      const result = await setupPushNotifications(
        vapidPublicKey,
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
        if (shouldUseBackendApi() && result.subscription) {
          const record = await registerPushSubscription(result.subscription)
          setNotificationState('ready', record ? `${result.message} 서버 구독 저장 완료` : result.message)
          return
        }

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
    if (!canUseBackendAccount) return
    setIsTestingNotification(true)

    try {
      if (shouldUseBackendApi()) {
        const result = await sendBackendTestPush()
        const outcome = getBackendPushTestOutcome(result)
        setNotificationState(outcome.status, outcome.message)
      } else {
        await showLocalTestNotification()
        setNotificationState('ready', '테스트 알림 발송 완료')
      }
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
          disabled={
            notificationStatus === 'checking' ||
            !canUseBackendAccount ||
            !pushPreflight.canRequest ||
            !vapidConfigured ||
            isLoadingPushConfig
          }
          onClick={() => void handleEnablePush()}
        >
          {notificationStatus === 'checking' || isLoadingPushConfig ? '확인 중' : '알림 켜기'}
        </button>
        <button
          type="button"
          className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-4 text-[0.82rem] font-bold text-[var(--color-content-default)] transition-all hover:border-[var(--color-border-brand)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isTestingNotification || !canSendTestNotification || !canUseBackendAccount}
          onClick={() => void handleTestNotification()}
        >
          {isTestingNotification ? '발송 중' : '테스트'}
        </button>
      </div>
      {requiresAccount && (
        <AccountRequiredCard
          actionLabel="푸시 구독과 테스트 알림은 가입 후 서버 계정에 연결됩니다."
          className="p-3"
        />
      )}
      {!vapidConfigured && (
        <p className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 py-2 text-[0.76rem] text-[var(--color-content-muted)]">
          서버 VAPID 공개키를 불러오지 못해 푸시 구독을 만들 수 없습니다.
        </p>
      )}
    </Panel>
  )
}

function getBackendPushTestOutcome(result: PushTestResultDto): {
  message: string
  status: 'error' | 'ready'
} {
  if (result.sent > 0 && result.failed === 0) {
    return {
      message: `서버 테스트 푸시 ${result.sent}건 발송 완료`,
      status: 'ready',
    }
  }

  if (result.sent > 0) {
    return {
      message: `테스트 푸시 ${result.sent}건 발송, ${result.failed}건 실패. 실패한 기기는 다시 구독하세요.`,
      status: 'error',
    }
  }

  if (result.inactiveIds.length > 0) {
    return {
      message: '저장된 푸시 구독이 만료되었거나 서버 키와 맞지 않아 제거되었습니다. 알림을 다시 켜세요.',
      status: 'error',
    }
  }

  if (result.failed > 0) {
    return {
      message: `저장된 구독으로 테스트 푸시 ${result.failed}건 발송 실패. 알림을 다시 켜세요.`,
      status: 'error',
    }
  }

  return {
    message: '활성 푸시 구독이 없습니다. 알림 켜기부터 다시 실행하세요.',
    status: 'error',
  }
}
