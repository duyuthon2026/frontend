import { describe, expect, it } from 'vitest'
import { getNotificationClientPath, normalizePushPayload } from './pushPayload'

const origin = 'https://janban.example'

describe('push payload helpers', () => {
  it('drops malformed notification URLs instead of throwing', () => {
    const payload = normalizePushPayload(
      {
        body: '내용',
        icon: 'http://[invalid-icon',
        title: '제목',
        url: 'http://[invalid-url',
      },
      origin,
    )

    expect(payload.body).toBe('내용')
    expect(payload.icon).toBeUndefined()
    expect(payload.title).toBe('제목')
    expect(payload.url).toBeUndefined()
  })

  it('keeps same-origin client paths and rejects external targets', () => {
    expect(getNotificationClientPath({ url: '/inventory?filter=soon#item' }, origin)).toBe(
      '/inventory?filter=soon#item',
    )
    expect(getNotificationClientPath({ url: 'https://evil.example/phish' }, origin)).toBeUndefined()
  })
})
