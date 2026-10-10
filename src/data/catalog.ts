import { isItem } from '../lib/discovery.mjs'
import { normalizeUrl } from '../../scripts/digest-lib.mjs'
import { items as editorial, type Item } from './items'

export interface DigestFile {
  updatedAt: string
  items: Item[]
}

let digestItems: Item[] = []
let updatedAt = ''
let loadFailed = false
export function digestLoadFailed() { return loadFailed }

export async function loadDigest() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}digest.json`, { cache: 'no-cache', signal: AbortSignal.timeout(8000) })
    if (!response.ok) throw new Error('Digest unavailable')
    const data = (await response.json()) as DigestFile
    if (!data || !Array.isArray(data.items)) throw new Error('Invalid digest')
    loadFailed = false
    digestItems = (Array.isArray(data?.items) ? data.items : []).filter(isItem)
    updatedAt = typeof data.updatedAt === 'string' ? data.updatedAt : ''
  } catch {
    loadFailed = true
    digestItems = []
    updatedAt = ''
  }
}

export function getUpdatedAt() {
  return updatedAt
}

export function getItems() {
  const urls = new Set(editorial.map((item) => normalizeUrl(item.source.url)))
  const slugs = new Set(editorial.map(item => item.slug))
  const auto = digestItems.filter(item => {
    const url = normalizeUrl(item.source.url)
    if (urls.has(url) || slugs.has(item.slug)) return false
    urls.add(url); slugs.add(item.slug); return true
  })
  return [...auto, ...editorial]
}

export function itemBySlug(slug: string) {
  return getItems().find((item) => item.slug === slug)
}

export function relatedItems(slug: string, limit = 3) {
  const current = itemBySlug(slug)
  if (!current) return []
  const relevance = (item: Item) => (item.category === current.category ? 1 : 0) + item.tags.filter(tag => current.tags.some(other => other.toLowerCase() === tag.toLowerCase())).length * 3
  return getItems()
    .filter(item => item.slug !== slug && relevance(item) > 0)
    .sort((a, b) => relevance(b) - relevance(a) || b.date.localeCompare(a.date))
    .slice(0, limit)
}
