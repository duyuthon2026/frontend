import { describe, expect, it } from 'vitest'
import {
  getCameraErrorMessage,
  getCameraPreflight,
  getCameraRuntimeStatus,
} from './cameraAccess'

describe('camera access helpers', () => {
  it('blocks camera requests outside secure contexts with ops guidance', () => {
    expect(
      getCameraPreflight({
        hasGetUserMedia: false,
        isSecureContext: false,
      }),
    ).toEqual({
      canRequest: false,
      message:
        '카메라는 HTTPS 또는 localhost 같은 보안 컨텍스트에서만 사용할 수 있습니다. 백엔드 서빙 시 HTTPS와 Permissions-Policy: camera=(self)를 확인하세요.',
      status: 'error',
    })
  })

  it('reports unsupported browsers before requesting permission', () => {
    expect(
      getCameraPreflight({
        hasGetUserMedia: false,
        isSecureContext: true,
      }),
    ).toMatchObject({
      canRequest: false,
      status: 'unsupported',
    })
  })

  it('maps browser permission errors to actionable Korean messages', () => {
    expect(getCameraErrorMessage(new DOMException('denied', 'NotAllowedError'))).toContain(
      '카메라 권한이 차단되었습니다',
    )
    expect(getCameraErrorMessage(new DOMException('missing', 'NotFoundError'))).toContain(
      '카메라 장치',
    )
  })

  it('classifies blocked permission errors for status pills', () => {
    expect(getCameraRuntimeStatus(new DOMException('denied', 'NotAllowedError'))).toBe('blocked')
    expect(getCameraRuntimeStatus(new DOMException('busy', 'NotReadableError'))).toBe('error')
  })
})
