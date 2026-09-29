import { items as editorial, type Item } from './items'

export interface DigestFile {
  updatedAt: string
  items: Item[]
}

let digestItems: Item[] = []
let updatedAt = ''

function isItem(value: unknown): value is Item {
  if (!value || typeof value !== 'object') return false
  const item = value as Item
  return Boolean(item.slug && item.title && item.date && item.summary && item.source?.url)
}

export async function loadDigest() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}digest.json`, { cache: 'no-cache' })
    if (!response.ok) return
    const data = (await response.json()) as DigestFile
    digestItems = (data.items ?? []).filter(isItem)
    updatedAt = typeof data.updatedAt === 'string' ? data.updatedAt : ''
  } catch {
    digestItems = []
    updatedAt = ''
  }
}

export function getUpdatedAt() {
  return updatedAt
}

export function getItems() {
  const urls = new Set(editorial.map((item) => item.source.url))
  const auto = digestItems.filter((item) => !urls.has(item.source.url))
  return [...auto, ...editorial]
}

export function itemBySlug(slug: string) {
  return getItems().find((item) => item.slug === slug)
}

export function relatedItems(slug: string, limit = 3) {
  const current = itemBySlug(slug)
  if (!current) return []
  return getItems()
    .filter((item) => item.slug !== slug && item.category === current.category)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit)
}
