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
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<CameraState['status']>('idle')

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setStatus('idle')
  }, [])

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support camera access.')
      setStatus('unsupported')
      return
    }

    setError('')
    setStatus('starting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia(cameraConstraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setStatus('active')
    } catch (cameraError) {
      setError(
        cameraError instanceof Error
          ? cameraError.message
          : 'Unable to start the camera.',
      )
      setStatus('error')
    }
  }, [])

  useEffect(() => stopCamera, [stopCamera])

  return {
    error,
    isActive: status === 'active',
    startCamera,
    status,
    stopCamera,
    videoRef,
  }
}
