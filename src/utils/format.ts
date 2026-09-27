const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatRupiah(value: number): string {
  return rupiah.format(value).replace(/\s/g, '')
}

export function formatRupiahShort(value: number): string {
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toLocaleString('id-ID')}jt`
  if (value >= 1_000_000) {
    const n = value / 1_000_000
    const s = Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',')
    return `Rp${s}jt`
  }
  if (value >= 1_000) return `Rp${Math.round(value / 1_000)}rb`
  return `Rp${value}`
}

const dateLong = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const dateShort = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateFull = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

const weekdayLong = new Intl.DateTimeFormat('id-ID', { weekday: 'long' })
const dateShortNumeric = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** "Selasa, 29 Sep 2026 · 14:00 WIB" */
export function formatDateTimeID(date: string, time: string): string {
  const d = new Date(`${date}T00:00:00`)
  return `${weekdayLong.format(d)}, ${dateShortNumeric.format(d)} · ${time} WIB`
}

export function formatWeekdayLong(value: string | Date): string {
  return weekdayLong.format(new Date(value))
}

const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
const weekdayShort = new Intl.DateTimeFormat('id-ID', { weekday: 'short' })
const dayNum = new Intl.DateTimeFormat('id-ID', { day: 'numeric' })

export function formatDateLong(value: string | Date): string {
  return dateLong.format(new Date(value))
}

export function formatDateShort(value: string | Date): string {
  return dateShort.format(new Date(value))
}

export function formatDateFull(value: string | Date): string {
  return dateFull.format(new Date(value))
}

export function formatMonthYear(value: string | Date): string {
  return monthLabel.format(new Date(value))
}

export function formatWeekday(value: string | Date): string {
  return weekdayShort.format(new Date(value))
}

export function formatDayNumber(value: string | Date): string {
  return dayNum.format(new Date(value))
}

export function formatRelativeTime(value: string | Date): string {
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return formatDateShort(value)
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isSameISODate(a: string, b: string): boolean {
  return a === b
}
