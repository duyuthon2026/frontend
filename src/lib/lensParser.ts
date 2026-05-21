import { isStorageLocation, type StorageLocation } from '../domain/prototype'
import { formatQuantityLabel, getDefaultQuantityUnit, parseQuantityFromText } from './quantity'
import { getRelativeDateString, isIsoLocalDateString } from './date'

export type ParsedLensCandidate = {
  name: string
  quantity: string
  location: StorageLocation
  expiresAt: string
}

const koreanCountWords: Array<[RegExp, string]> = [
  [/한\s*(개|팩|송이|장|알|모|봉|병|캔)/g, '1$1'],
  [/두\s*(개|팩|송이|장|알|모|봉|병|캔)/g, '2$1'],
  [/세\s*(개|팩|송이|장|알|모|봉|병|캔)/g, '3$1'],
]

const quantityPattern = /(\d+\s*\/\s*\d+|\d+(?:\.\d+)?|\.\d+)\s*(g|kg|개|팩|송이|장|알|모|봉|병|캔)/gi
const relativeDayPattern = /(D\s*-\s*)?(\d+)\s*(일\s*(뒤|후)?|days?|d)/i
const isoDatePattern = /\b\d{4}-\d{2}-\d{2}\b/

export function parseLensNaturalText(
  rawText: string,
  baseDate = new Date(),
): ParsedLensCandidate | null {
  const text = normalizeKoreanCountWords(rawText.trim())
  if (!text) return null

  const location = parseStorageLocation(text)
  const name = parseIngredientName(text)
  const parsedQuantity = parseQuantityFromText(text, getDefaultQuantityUnit(name || text, '개'))

  return {
    name: name || text,
    quantity: formatQuantityLabel(parsedQuantity.amount, parsedQuantity.unit),
    location,
    expiresAt: parseExpiresAt(text, baseDate),
  }
}

function normalizeKoreanCountWords(text: string) {
  return koreanCountWords.reduce(
    (normalized, [pattern, replacement]) => normalized.replace(pattern, replacement),
    text,
  )
}

function parseStorageLocation(text: string): StorageLocation {
  const location = ['냉장', '냉동', '실온'].find((candidate) => text.includes(candidate))
  return isStorageLocation(location) ? location : '냉장'
}

function parseIngredientName(text: string) {
  const withoutKnownTokens = text
    .replace(quantityPattern, ' ')
    .replace(relativeDayPattern, ' ')
    .replace(isoDatePattern, ' ')
    .replace(/냉장|냉동|실온|보관|까지|소비기한|유통기한/gi, ' ')
    .replace(/[,.，。]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return withoutKnownTokens
}

function parseExpiresAt(text: string, baseDate: Date) {
  const isoDate = text.match(isoDatePattern)?.[0]
  if (isIsoLocalDateString(isoDate)) return isoDate

  const relativeDay = text.match(relativeDayPattern)
  const daysOffset = relativeDay ? Number(relativeDay[2]) : 3

  return getRelativeDateString(Number.isFinite(daysOffset) ? daysOffset : 3, baseDate)
}
