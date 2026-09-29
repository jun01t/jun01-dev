export function dayInTokyo(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function timestampInTokyo(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type) => parts.find((part) => part.type === type)?.value ?? '00'
  const hour = get('hour') === '24' ? '00' : get('hour')
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}:${get('second')}+09:00`
}

/** @param {string} iso */
export function formatDate(iso) {
  if (typeof iso !== 'string' || iso.length < 10) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso.replaceAll('-', '.')
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10).replaceAll('-', '.')
  return dayInTokyo(date).replaceAll('-', '.')
}

export function cutoffDay(now, maxAgeDays = 21) {
  return dayInTokyo(new Date(now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000))
}

/** @param {string} value */
export function safeHttpUrl(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
    return trimmed
  } catch {
    return ''
  }
}
