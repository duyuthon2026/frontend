import { describe, expect, it } from 'vitest'
import { getPushPreflight } from './pwa'

describe('push preflight helpers', () => {
  it('blocks iOS Safari tabs with home screen app guidance', () => {
    expect(
      getPushPreflight({
        hasNotification: false,
        hasPushManager: false,
        isIOS: true,
        isSecureContext: true,
        isStandalone: false,
      }),
    ).toEqual({
      canRequest: false,
      message:
        'iOS Safari 탭에서는 푸시 구독을 만들 수 없습니다. 공유 버튼에서 홈 화면에 추가한 뒤 홈 화면 아이콘으로 실행해 알림을 켜세요.',
      status: 'unsupported',
    })
  })

  it('allows push setup when secure notification and push APIs are available', () => {
    expect(
      getPushPreflight({
        hasNotification: true,
        hasPushManager: true,
        isIOS: true,
        isSecureContext: true,
        isStandalone: true,
      }),
    ).toMatchObject({
      canRequest: true,
    })
  })
})
