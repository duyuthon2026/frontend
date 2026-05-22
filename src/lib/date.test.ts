import { describe, expect, it } from 'vitest'
import {
  formatLocalDate,
  getRelativeDateString,
  isIsoLocalDateString,
  parseLocalDate,
} from './date'

describe('date utilities', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    expect(formatLocalDate(new Date(2026, 4, 21))).toBe('2026-05-21')
  })

  it('creates relative local dates from a stable base date', () => {
    expect(getRelativeDateString(3, new Date(2026, 4, 21))).toBe('2026-05-24')
  })

  it('rejects invalid ISO-like dates', () => {
    expect(isIsoLocalDateString('2026-02-30')).toBe(false)
    expect(parseLocalDate('not-a-date')).toBeNull()
  })
})
