export type QuantityParts = {
  amount: string
  unit: string
}

const defaultUnit = '개'

const unitByName: Array<[RegExp, string]> = [
  [/두부|묵/, '모'],
  [/상추|깻잎|배추잎|장/, '장'],
  [/버섯|브로콜리|대파|바나나/, '송이'],
  [/연어|삼겹살|고기|소고기|돼지고기|닭고기|필렛/, 'g'],
  [/토마토|방울토마토|딸기|블루베리/, '팩'],
  [/우유|주스|소스|간장|식초|오일/, '병'],
]

const toDecimalString = (value: string) => {
  const fraction = value.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (!fraction) return value

  const numerator = Number(fraction[1])
  const denominator = Number(fraction[2])

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return value
  }

  return Number.parseFloat((numerator / denominator).toFixed(2)).toString()
}

export const sanitizeQuantityAmount = (value: string) => {
  const normalized = value.replace(/,/g, '.').replace(/[^\d.]/g, '')
  const dotIndex = normalized.indexOf('.')

  if (dotIndex === -1) {
    return normalized.replace(/^0+(?=\d)/, '')
  }

  const integer = normalized.slice(0, dotIndex).replace(/^0+(?=\d)/, '')
  const decimal = normalized.slice(dotIndex + 1).replace(/\./g, '').slice(0, 2)

  return `${integer || '0'}.${decimal}`
}

const normalizeAmountForSave = (amount: string) => {
  const sanitized = sanitizeQuantityAmount(amount)

  if (!sanitized || sanitized === '0.') return '1'
  if (sanitized.endsWith('.')) return sanitized.slice(0, -1) || '1'
  return sanitized
}

export const getDefaultQuantityUnit = (name: string, fallback = defaultUnit) => {
  const trimmedName = name.trim()
  const match = unitByName.find(([pattern]) => pattern.test(trimmedName))

  return match?.[1] ?? fallback
}

export const parseQuantityLabel = (
  quantity: string,
  fallbackUnit = defaultUnit,
): QuantityParts => {
  const trimmed = quantity.trim()
  const match = trimmed.match(/^(\d+\s*\/\s*\d+|\d+(?:\.\d+)?|\.\d+)\s*(\D.*)?$/)

  if (!match) {
    return {
      amount: '1',
      unit: fallbackUnit,
    }
  }

  return {
    amount: normalizeAmountForSave(toDecimalString(match[1])),
    unit: match[2]?.trim() || fallbackUnit,
  }
}

export const formatQuantityLabel = (amount: string, unit: string) => {
  const sanitizedAmount = normalizeAmountForSave(amount)
  return `${sanitizedAmount}${unit || defaultUnit}`
}

export const parseQuantityFromText = (text: string, fallbackUnit = defaultUnit): QuantityParts => {
  const match = text.match(/(\d+\s*\/\s*\d+|\d+(?:\.\d+)?|\.\d+)\s*(g|kg|개|팩|송이|장|알|모|봉|병|캔)/i)

  if (!match) {
    return {
      amount: '1',
      unit: fallbackUnit,
    }
  }

  return {
    amount: normalizeAmountForSave(toDecimalString(match[1])),
    unit: match[2],
  }
}
