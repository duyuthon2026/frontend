import type { RefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getBrowserCameraPreflight,
  getCameraErrorMessage,
  getCameraRuntimeStatus,
  queryBrowserCameraPermissionState,
} from '../lib/cameraAccess'
import { useDeviceStore } from '../stores/useDeviceStore'

const cameraConstraints: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    height: { ideal: 1280 },
    width: { ideal: 720 },
  },
}

export type CameraState = {
  error: string
  isActive: boolean
  startCamera: () => Promise<void>
  status: 'idle' | 'starting' | 'active' | 'blocked' | 'unsupported' | 'error'
  stopCamera: () => void
  videoRef: RefObject<HTMLVideoElement | null>
}

export function useCamera(): CameraState {
  const isMountedRef = useRef(true)
  const requestIdRef = useRef(0)
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const setCameraState = useDeviceStore((state) => state.setCameraState)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<CameraState['status']>('idle')

  const stopCamera = useCallback(() => {
    requestIdRef.current += 1
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (isMountedRef.current) {
      setStatus('idle')
    }
    setCameraState('idle', '카메라 대기 중. HTTPS 환경에서 권한 요청 가능')
  }, [setCameraState])

  const startCamera = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    const cameraPreflight = getBrowserCameraPreflight()

    if (!cameraPreflight.canRequest) {
      if (isMountedRef.current) {
        setError(cameraPreflight.message)
        setStatus(cameraPreflight.status)
        setCameraState(cameraPreflight.status, cameraPreflight.message)
      }
      return
    }

    const permissionState = await queryBrowserCameraPermissionState()

    if (!isMountedRef.current || requestIdRef.current !== requestId) {
      return
    }

    if (permissionState === 'denied') {
      const permissionMessage = getCameraErrorMessage({
        message: 'denied',
        name: 'NotAllowedError',
      })

      if (isMountedRef.current) {
        setError(permissionMessage)
        setStatus('blocked')
        setCameraState('blocked', permissionMessage)
      }
      return
    }

    setError('')
    setStatus('starting')
    setCameraState('checking', '카메라 권한 요청 중')

    let stream: MediaStream | null = null

    try {
      stream = await navigator.mediaDevices.getUserMedia(cameraConstraints)

      if (!isMountedRef.current || requestIdRef.current !== requestId) {
        stopStream(stream)
        return
      }

      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      if (isMountedRef.current && requestIdRef.current === requestId) {
        setStatus('active')
        setCameraState('active', '카메라 활성화됨')
      }
    } catch (cameraError) {
      if (stream) {
        stopStream(stream)
        if (streamRef.current === stream) {
          streamRef.current = null
        }
        if (videoRef.current?.srcObject === stream) {
          videoRef.current.srcObject = null
        }
      }

      if (isMountedRef.current && requestIdRef.current === requestId) {
        const cameraMessage = getCameraErrorMessage(cameraError)
        const cameraStatus = getCameraRuntimeStatus(cameraError)

        setError(cameraMessage)
        setStatus(cameraStatus)
        setCameraState(cameraStatus, cameraMessage)
      }
    }
  }, [setCameraState])

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      stopCamera()
    }
  }, [stopCamera])

  return {
    error,
    isActive: status === 'active',
    startCamera,
    status,
    stopCamera,
    videoRef,
  }
}

function stopStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop())
}
