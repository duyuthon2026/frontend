import type { RefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

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
  status: 'idle' | 'starting' | 'active' | 'unsupported' | 'error'
  stopCamera: () => void
  videoRef: RefObject<HTMLVideoElement | null>
}

export function useCamera(): CameraState {
  const isMountedRef = useRef(true)
  const requestIdRef = useRef(0)
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
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
  }, [])

  const startCamera = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    if (!navigator.mediaDevices?.getUserMedia) {
      if (isMountedRef.current) {
        setError('이 브라우저는 카메라 접근을 지원하지 않습니다.')
        setStatus('unsupported')
      }
      return
    }

    setError('')
    setStatus('starting')

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
      }
    } catch (cameraError) {
      if (stream) {
        stopStream(stream)
      }

      if (isMountedRef.current && requestIdRef.current === requestId) {
        setError(
          cameraError instanceof Error
            ? cameraError.message
            : '카메라를 시작할 수 없습니다.',
        )
        setStatus('error')
      }
    }
  }, [])

  useEffect(() => {
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
