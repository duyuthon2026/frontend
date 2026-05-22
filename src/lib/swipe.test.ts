import { describe, expect, it } from 'vitest'
import {
  shouldRemoveCandidateBySwipe,
  shouldSuppressCandidateClickAfterSwipe,
} from './swipe'

describe('candidate swipe helpers', () => {
  it('removes approval candidates only on deliberate left swipes', () => {
    expect(shouldRemoveCandidateBySwipe({ offsetX: -92, velocityX: -120 })).toBe(true)
    expect(shouldRemoveCandidateBySwipe({ offsetX: -20, velocityX: -620 })).toBe(true)
    expect(shouldRemoveCandidateBySwipe({ offsetX: -48, velocityX: -220 })).toBe(false)
    expect(shouldRemoveCandidateBySwipe({ offsetX: 92, velocityX: 800 })).toBe(false)
  })

  it('suppresses the follow-up click after a horizontal swipe gesture', () => {
    expect(shouldSuppressCandidateClickAfterSwipe({ offsetX: -10, velocityX: -20 })).toBe(true)
    expect(shouldSuppressCandidateClickAfterSwipe({ offsetX: -2, velocityX: -160 })).toBe(true)
    expect(shouldSuppressCandidateClickAfterSwipe({ offsetX: -2, velocityX: -40 })).toBe(false)
  })
})
