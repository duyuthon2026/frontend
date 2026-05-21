import { useEffect } from 'react'
import { Panel } from '../../components/ui/Panel'
import { useCamera } from '../../hooks/useCamera'
import { useDeviceStore } from '../../stores/useDeviceStore'

export function CameraCaptureCard() {
  const {
    error: cameraError,
    isActive: cameraIsActive,
    startCamera,
    status: cameraHookStatus,
    stopCamera,
    videoRef,
  } = useCamera()
  const { cameraMessage, setCameraState } = useDeviceStore()

  useEffect(() => {
    if (cameraHookStatus === 'active') {
      setCameraState('active', '촬영 준비 완료')
      return
    }

    if (cameraHookStatus === 'starting') {
      setCameraState('checking', '카메라 여는 중')
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

    setCameraState('idle', '식판 또는 냉장고를 촬영해 분석 대기열에 올림')
  }, [cameraError, cameraHookStatus, setCameraState])

  const handleCameraToggle = () => {
    if (cameraIsActive) {
      stopCamera()
      return
    }

    void startCamera()
  }

  return (
    <Panel
      id="capture"
      className="space-y-4"
      eyebrow="Camera"
      title="식판 촬영"
      description={<p>{cameraMessage}</p>}
    >
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <video
          ref={videoRef}
          aria-label="카메라 미리보기"
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
        {!cameraIsActive && (
          <span className="absolute text-sm font-medium text-slate-500">Preview</span>
        )}
      </div>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={cameraHookStatus === 'starting'}
        onClick={handleCameraToggle}
      >
        {cameraIsActive ? '촬영 종료' : '카메라 시작'}
      </button>
    </Panel>
  )
}
