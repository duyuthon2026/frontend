export type CameraPreflightInput = {
  hasGetUserMedia: boolean
  isSecureContext: boolean
}

export type CameraPreflightResult =
  | {
      canRequest: true
      message: string
    }
  | {
      canRequest: false
      message: string
      status: 'error' | 'unsupported'
    }

export type CameraPermissionState = PermissionState | 'unsupported'

export type CameraRuntimeStatus = 'blocked' | 'error'

const secureContextMessage =
  '카메라는 HTTPS 또는 localhost 같은 보안 컨텍스트에서만 사용할 수 있습니다. 백엔드 서빙 시 HTTPS와 Permissions-Policy: camera=(self)를 확인하세요.'

const unsupportedMessage =
  '이 브라우저는 카메라 접근을 지원하지 않습니다. 사진 업로드 또는 자연어 입력으로 계속 진행하세요.'

const blockedMessage =
  '카메라 권한이 차단되었습니다. 브라우저 사이트 설정에서 카메라 권한을 허용한 뒤 다시 시도하세요.'

export function getCameraPreflight({
  hasGetUserMedia,
  isSecureContext,
}: CameraPreflightInput): CameraPreflightResult {
  if (!isSecureContext) {
    return {
      canRequest: false,
      message: secureContextMessage,
      status: 'error',
    }
  }

  if (!hasGetUserMedia) {
    return {
      canRequest: false,
      message: unsupportedMessage,
      status: 'unsupported',
    }
  }

  return {
    canRequest: true,
    message: '카메라 권한을 요청할 수 있습니다.',
  }
}

export function getBrowserCameraPreflight(): CameraPreflightResult {
  return getCameraPreflight({
    hasGetUserMedia: Boolean(
      navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices,
    ),
    isSecureContext: window.isSecureContext,
  })
}

export async function queryBrowserCameraPermissionState(): Promise<CameraPermissionState> {
  if (!navigator.permissions || !('query' in navigator.permissions)) {
    return 'unsupported'
  }

  try {
    const permissionStatus = await navigator.permissions.query({ name: 'camera' })
    return permissionStatus.state
  } catch {
    return 'unsupported'
  }
}

export function getCameraRuntimeStatus(error: unknown): CameraRuntimeStatus {
  const errorName = getErrorName(error)

  return errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError'
    ? 'blocked'
    : 'error'
}

export function getCameraErrorMessage(error: unknown) {
  const errorName = getErrorName(error)

  switch (errorName) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return blockedMessage
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return '사용 가능한 카메라 장치를 찾을 수 없습니다. 외장 카메라 연결 또는 사진 업로드를 사용하세요.'
    case 'NotReadableError':
    case 'TrackStartError':
      return '카메라가 다른 앱에서 사용 중이거나 OS가 접근을 차단했습니다. 다른 앱을 종료한 뒤 다시 시도하세요.'
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return '요청한 카메라 해상도 또는 후면 카메라 조건을 만족하지 못했습니다. 다른 기기나 사진 업로드를 사용하세요.'
    case 'SecurityError':
      return secureContextMessage
    case 'AbortError':
      return '카메라 시작이 중단되었습니다. 잠시 후 다시 시도하거나 사진 업로드를 사용하세요.'
    default:
      return getErrorMessage(error).trim()
        ? `카메라를 시작할 수 없습니다. ${getErrorMessage(error)}`
        : '카메라를 시작할 수 없습니다. 사진 업로드 또는 자연어 입력으로 계속 진행하세요.'
  }
}

function getErrorName(error: unknown) {
  return isErrorLike(error) ? error.name : ''
}

function getErrorMessage(error: unknown) {
  return isErrorLike(error) ? error.message : ''
}

function isErrorLike(error: unknown): error is { message: string; name: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'name' in error &&
    typeof error.message === 'string' &&
    typeof error.name === 'string'
  )
}
