import { describe, expect, it } from 'vitest'
import {
  formatQuantityLabel,
  getDefaultQuantityUnit,
  parseQuantityFromText,
  parseQuantityLabel,
  sanitizeQuantityAmount,
} from './quantity'

describe('quantity utilities', () => {
  it('sanitizes decimal amounts for numeric input', () => {
    expect(sanitizeQuantityAmount('001,25개')).toBe('1.25')
    expect(sanitizeQuantityAmount('0..75')).toBe('0.75')
  })

  it('parses fraction labels into decimal amount and unit', () => {
    expect(parseQuantityLabel('1/2개')).toEqual({ amount: '0.5', unit: '개' })
  })

  it('uses ingredient-specific default units', () => {
    expect(getDefaultQuantityUnit('두부')).toBe('모')
    expect(getDefaultQuantityUnit('삼겹살')).toBe('g')
  })

  it('formats blank quantities with a safe default amount', () => {
    expect(formatQuantityLabel('', '팩')).toBe('1팩')
  })

  it('parses quantity from free-form text', () => {
    expect(parseQuantityFromText('삼겹살 300g 냉동 14일')).toEqual({ amount: '300', unit: 'g' })
  })
})
