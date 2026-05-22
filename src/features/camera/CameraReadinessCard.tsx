import { useEffect } from 'react'
import { Panel } from '../../components/ui/Panel'
import { StatusPill } from '../../components/ui/StatusPill'
import { getBrowserCameraPreflight } from '../../lib/cameraAccess'
import { useDeviceStore } from '../../stores/useDeviceStore'

export function CameraReadinessCard() {
  const cameraMessage = useDeviceStore((state) => state.cameraMessage)
  const cameraStatus = useDeviceStore((state) => state.cameraStatus)
  const setCameraState = useDeviceStore((state) => state.setCameraState)

  useEffect(() => {
    const preflight = getBrowserCameraPreflight()

    if (!preflight.canRequest) {
      setCameraState(preflight.status, preflight.message)
      return
    }

    if (cameraStatus === 'idle') {
      setCameraState('idle', '카메라 권한은 Lens 탭의 사용자 동작 뒤 요청됩니다.')
    }
  }, [cameraStatus, setCameraState])

  return (
    <Panel
      className="gap-4"
      eyebrow="Camera"
      title="촬영 권한 준비"
      description={
        <>
          <p>{cameraMessage}</p>
          <p>운영 배포에서는 HTTPS와 Permissions-Policy 헤더가 필수입니다.</p>
        </>
      }
    >
      <StatusPill label="Camera" status={cameraStatus} />
    </Panel>
  )
}
