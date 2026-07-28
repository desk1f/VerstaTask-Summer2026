const dateFormatter = new Intl.DateTimeFormat('ru-RU')
const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const weightFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

export function formatDateTimeUtc(value: string): string {
  const normalizedValue = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`
  return dateTimeFormatter.format(new Date(normalizedValue))
}

export function formatWeight(value: number): string {
  return `${weightFormatter.format(value)} кг`
}
