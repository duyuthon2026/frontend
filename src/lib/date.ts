const isoLocalDatePattern = /^\d{4}-\d{2}-\d{2}$/

export function formatLocalDate(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

export function getRelativeDateString(daysOffset: number, baseDate = new Date()): string {
  const localDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() + daysOffset,
  )

  return formatLocalDate(localDate)
}

export function isIsoLocalDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !isoLocalDatePattern.test(value)) return false

  return parseLocalDate(value) !== null
}

export function parseLocalDate(dateStr: string): Date | null {
  if (!isoLocalDatePattern.test(dateStr)) return null

  const [yearRaw, monthRaw, dayRaw] = dateStr.split('-')
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}
