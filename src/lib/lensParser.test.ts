import { describe, expect, it } from 'vitest'
import { parseLensNaturalText } from './lensParser'

describe('parseLensNaturalText', () => {
  const baseDate = new Date(2026, 4, 21)

  it('parses Korean count words, storage location, and relative expiry days', () => {
    expect(parseLensNaturalText('두부 한 모 냉장 3일', baseDate)).toEqual({
      name: '두부',
      quantity: '1모',
      location: '냉장',
      expiresAt: '2026-05-24',
    })
  })

  it('parses generic weighted ingredients without hardcoded names', () => {
    expect(parseLensNaturalText('삼겹살 300g 냉동 14일', baseDate)).toEqual({
      name: '삼겹살',
      quantity: '300g',
      location: '냉동',
      expiresAt: '2026-06-04',
    })
  })

  it('uses a safe fallback for minimal input', () => {
    expect(parseLensNaturalText('상추', baseDate)).toEqual({
      name: '상추',
      quantity: '1장',
      location: '냉장',
      expiresAt: '2026-05-24',
    })
  })
})
