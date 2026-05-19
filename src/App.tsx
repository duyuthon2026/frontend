import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'
import { useCamera } from './hooks/useCamera'
import {
  registerAppServiceWorker,
  setupPushNotifications,
  showLocalTestNotification,
} from './lib/pwa'
import { useDeviceStore } from './stores/useDeviceStore'

function App() {
  const {
    error: cameraError,
    isActive: cameraIsActive,
    startCamera,
    status: cameraHookStatus,
    stopCamera,
    videoRef,
  } = useCamera()
  const [isTestingNotification, setIsTestingNotification] = useState(false)
  const {
    cameraMessage,
    cameraStatus,
    notificationMessage,
    notificationStatus,
    serviceWorkerMessage,
    serviceWorkerStatus,
    setCameraState,
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
      setServiceWorkerState('unsupported', 'Service workers are not supported.')
      return
    }

    setServiceWorkerState('checking', 'Registering service worker...')
    serviceWorker.ready
      .then(() => {
        setServiceWorkerState('ready', 'Service worker is ready.')
      })
      .catch((error) => {
        setServiceWorkerState(
          'error',
          error instanceof Error
            ? error.message
            : 'Service worker registration failed.',
        )
      })
  }, [setServiceWorkerState])

  useEffect(() => {
    if (cameraHookStatus === 'active') {
      setCameraState('active', 'Camera preview is active.')
      return
    }

    if (cameraHookStatus === 'starting') {
      setCameraState('checking', 'Starting camera...')
      return
    }

    if (cameraHookStatus === 'unsupported') {
      setCameraState('unsupported', cameraError)
      return
    }

    if (cameraHookStatus === 'error') {
      setCameraState('error', cameraError)
      return
    }

    setCameraState('idle', 'Camera not started.')
  }, [cameraError, cameraHookStatus, setCameraState])

  const handleEnablePush = async () => {
    setNotificationState('checking', 'Requesting notification permission...')

    try {
      const result = await setupPushNotifications(
        import.meta.env.VITE_VAPID_PUBLIC_KEY,
      )

      if (result.status === 'subscribed' || result.status === 'ready') {
        setNotificationState('ready', result.message)
        return
      }

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
        error instanceof Error ? error.message : 'Push setup failed.',
      )
    }
  }

  const handleTestNotification = async () => {
    setIsTestingNotification(true)

    try {
      await showLocalTestNotification()
      setNotificationState('ready', 'Local service worker notification sent.')
    } catch (error) {
      setNotificationState(
        'error',
        error instanceof Error ? error.message : 'Test notification failed.',
      )
    } finally {
      setIsTestingNotification(false)
    }
  }

  const handleCameraToggle = () => {
    if (cameraIsActive) {
      stopCamera()
      return
    }

    void startCamera()
  }

  return (
    <main className="app-shell">
      <motion.section
        className="hero-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="app-kicker">Mobile PWA setup</div>
        <h1>Bunruntime Mobile</h1>
        <p>
          Install-ready shell with service worker push handling and an
          environment-facing camera preview.
        </p>
      </motion.section>

      <section className="status-grid" aria-label="Platform readiness">
        <StatusPill label="Service worker" status={serviceWorkerStatus} />
        <StatusPill label="Push" status={notificationStatus} />
        <StatusPill label="Camera" status={cameraStatus} />
      </section>

      <section className="tool-grid">
        <motion.article
          className="tool-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <div>
            <p className="eyebrow">Service worker</p>
            <h2>Push notifications</h2>
            <p>{serviceWorkerMessage}</p>
            <p>{notificationMessage}</p>
          </div>

          <div className="action-stack">
            <button
              type="button"
              className="primary-action"
              disabled={notificationStatus === 'checking'}
              onClick={handleEnablePush}
            >
              {notificationStatus === 'checking' ? 'Checking...' : 'Enable push'}
            </button>
            <button
              type="button"
              className="secondary-action"
              disabled={isTestingNotification || !canSendTestNotification}
              onClick={handleTestNotification}
            >
              {isTestingNotification ? 'Sending...' : 'Send test'}
            </button>
          </div>

          {!vapidConfigured && (
            <p className="setup-note">
              Set <code>VITE_VAPID_PUBLIC_KEY</code> before server-backed push
              subscription.
            </p>
          )}
        </motion.article>

        <motion.article
          className="tool-card camera-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.35 }}
        >
          <div>
            <p className="eyebrow">Device camera</p>
            <h2>Camera preview</h2>
            <p>{cameraMessage}</p>
          </div>

          <div className="camera-frame">
            <video
              ref={videoRef}
              aria-label="Camera preview"
              autoPlay
              muted
              playsInline
            />
            {!cameraIsActive && <span>Preview</span>}
          </div>

          <button
            type="button"
            className="primary-action"
            disabled={cameraHookStatus === 'starting'}
            onClick={handleCameraToggle}
          >
            {cameraIsActive ? 'Stop camera' : 'Start camera'}
          </button>
        </motion.article>
      </section>
    </main>
  )
}

type StatusPillProps = {
  label: string
  status: string
}

function StatusPill({ label, status }: StatusPillProps) {
  return (
    <div className={`status-pill status-${status}`}>
      <span>{label}</span>
      <strong>{status}</strong>
    </div>
  )
}

export default App
