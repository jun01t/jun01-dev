import { dayInTokyo, safeHttpUrl } from '../../scripts/digest-lib.mjs'

export const WEIGHTS = Object.freeze({ recent: 30, primary: 12, security: 30, breaking: 24, release: 12, interest: 16 })
export const TOPICS = [
  { id: 'ai', label: 'AI / Claude Code / Codex', pattern: /\b(ai|claude|codex|openai|chatgpt|cursor)\b/i },
  { id: 'frontend', label: 'Vue / Nuxt / TypeScript', pattern: /\b(vue|nuxt|typescript|vite)\b/i },
  { id: 'rails', label: 'Rails / Ruby', pattern: /\b(rails|ruby)\b/i },
  { id: 'cloud', label: 'AWS / インフラ', pattern: /\b(aws|terraform|cloudfront|rds|lambda|infrastructure)\b|インフラ/i },
  { id: 'security', label: 'セキュリティ', pattern: /\b(security|vulnerability|cve)\b|セキュリティ|脆弱性/i },
  { id: 'gadget', label: 'ガジェット', pattern: /ガジェット|モニター|キーボード|マウス|\b(gadget|monitor|keyboard)\b/i },
]

/** @param {import('../data/items').Item} item */
export function topicsFor(item) {
  const text = [item.title, ...item.tags, item.source.name].join(' ')
  return TOPICS.filter(topic => topic.pattern.test(text) || topic.id === item.category).map(topic => topic.id)
}

/** @param {import('../data/items').Item} item @param {Date} now */
export function ageInDays(item, now = new Date()) {
  return (Date.parse(dayInTokyo(now)) - Date.parse(item.date)) / 86400000
}

/** @param {import('../data/items').Item} item @param {string[]} interests */
export function scoreItem(item, interests = [], now = new Date()) {
  const reasons = []
  let score = 0
  const add = (label, weight) => { score += weight; reasons.push(label) }
  const age = ageInDays(item, now)
  if (age >= 0 && age < 7) add('直近7日', Math.round(WEIGHTS.recent * (1 - age / 7)))
  if (item.source.kind === 'primary') add('一次情報', WEIGHTS.primary)
  // Only explicit headline signals count; generic summaries and editorial commentary do not.
  const title = item.title
  if (/\bCVE-\d{4}-\d+\b|\bsecurity (?:patch|fix|update|advisory)\b|\bvulnerabilit(?:y|ies)\b|脆弱性|セキュリティ(?:修正|更新|パッチ)/i.test(title)) add('セキュリティ修正の可能性', WEIGHTS.security)
  if (/\bbreaking changes?\b|\bend.of.life\b|\bEOL\b|破壊的変更|サポート.{0,12}(?:終了|終わ)/i.test(title)) add('互換性・サポート変更', WEIGHTS.breaking)
  if (/\b(?:released?|releases?)\b|リリース|\bv?\d+\.\d+(?:\.\d+)?\b/i.test(title)) add('リリース情報', WEIGHTS.release)
  if (interests.some(id => topicsFor(item).includes(id))) add('関心技術と一致', WEIGHTS.interest)
  return { score, reasons }
}

/** @param {import('../data/items').Item[]} items @param {string[]} interests */
export function rankItems(items, interests = [], now = new Date()) {
  return [...items].sort((a, b) => scoreItem(b, interests, now).score - scoreItem(a, interests, now).score || b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
}

/** @param {import('../data/items').Item[]} items */
export function filterItems(items, { query = '', category = '', autoOnly = false, savedOnly = false, saved = /** @type {string[]} */ ([]) } = {}) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return items.filter(item => (!category || item.category === category) && (!autoOnly || item.auto) && (!savedOnly || saved.includes(item.slug)) && terms.every(term => [item.title, item.summary, item.why, ...item.tags].join(' ').toLocaleLowerCase().includes(term)))
}

/** @param {unknown} value @returns {value is import('../data/items').Item} */
export function isItem(value) {
  if (!value || typeof value !== 'object') return false
  const item = /** @type {Record<string, any>} */ (value)
  return typeof item.slug === 'string' && /^[A-Za-z0-9-]+$/.test(item.slug)
    && ['title', 'summary', 'why'].every(key => typeof item[key] === 'string') && Boolean(item.title)
    && ['web', 'ai', 'cloud', 'gadget'].includes(item.category)
    && typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
    && Number.isFinite(Date.parse(item.date)) && new Date(item.date).toISOString().slice(0, 10) === item.date
    && ['tags', 'points'].every(key => Array.isArray(item[key]) && item[key].every(v => typeof v === 'string'))
    && Boolean(item.source && typeof item.source.name === 'string' && safeHttpUrl(item.source.url) && ['primary', 'roundup', 'own', 'review'].includes(item.source.kind))
    && (item.auto === undefined || typeof item.auto === 'boolean')
    && (item.collectedAt === undefined || (typeof item.collectedAt === 'string' && Number.isFinite(Date.parse(item.collectedAt))))
}
