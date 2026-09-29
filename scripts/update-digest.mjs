import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const OUT = new URL('../public/digest.json', import.meta.url)
const MAX_AGE_DAYS = 21
const MAX_ITEMS = 18
const PER_FEED = 4
const USER_AGENT = 'jun01-desk/1.0 (+https://blog.jun01t.com)'

const feeds = [
  {
    name: 'Cursor Changelog',
    url: 'https://cursor.com/changelog/rss.xml',
    category: 'ai',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'Claude Code',
    url: 'https://code.claude.com/docs/en/changelog/rss.xml',
    category: 'ai',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'Codex',
    url: 'https://developers.openai.com/codex/changelog/rss.xml',
    category: 'ai',
    kind: 'primary',
    mode: 'match',
  },
  {
    name: 'Ruby on Rails',
    url: 'https://rubyonrails.org/feed.xml',
    category: 'web',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'Nuxt Blog',
    url: 'https://nuxt.com/blog/rss.xml',
    category: 'web',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'Rails Releases',
    url: 'https://github.com/rails/rails/releases.atom',
    category: 'web',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'Nuxt Releases',
    url: 'https://github.com/nuxt/nuxt/releases.atom',
    category: 'web',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'Vue Releases',
    url: 'https://github.com/vuejs/core/releases.atom',
    category: 'web',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'Terraform Releases',
    url: 'https://github.com/hashicorp/terraform/releases.atom',
    category: 'cloud',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'AWS News Blog',
    url: 'https://aws.amazon.com/blogs/aws/feed/',
    category: 'cloud',
    kind: 'primary',
    mode: 'match',
  },
  {
    name: 'Publickey',
    url: 'https://www.publickey1.jp/atom.xml',
    category: 'cloud',
    kind: 'roundup',
    mode: 'match',
  },
  {
    name: 'PC Watch',
    url: 'https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf',
    category: 'gadget',
    kind: 'roundup',
    mode: 'match',
  },
]

const rules = [
  { category: 'ai', words: ['cursor', 'claude code', 'codex', 'mcp', 'model context protocol'] },
  { category: 'cloud', words: ['terraform', 'rds', 'aurora', 'cloudfront', 'postgresql', 'route 53', 'route53', 'lambda', 'ecs'] },
  { category: 'web', words: ['nuxt', 'vue', 'rails', 'ruby on rails', 'vite', 'web components', 'typescript'] },
  { category: 'gadget', words: ['モニター', 'キーボード', 'マウス', 'デスク', 'ガジェット', 'ロジクール', 'logicool', 'benq', 'kvm', 'usb-c', 'usb type-c', 'ドッキング', '在宅', 'ディスプレイ', 'トラックボール'] },
]

const categories = new Set(['web', 'ai', 'cloud', 'gadget'])

function decode(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function stripHtml(value) {
  return decode(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tagText(block, name) {
  const match = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))
  return match ? stripHtml(match[1]) : ''
}

function linkOf(block) {
  const text = block.match(/<link>([^<]+)<\/link>/i)
  if (text) return decode(text[1].trim())
  const tags = [...block.matchAll(/<link\b([^>]*)\/?>/gi)]
  let fallback = ''
  for (const tag of tags) {
    const href = tag[1].match(/\bhref="([^"]+)"/i)
    if (!href) continue
    const rel = tag[1].match(/\brel="([^"]+)"/i)
    if (!rel || rel[1] === 'alternate') return decode(href[1])
    fallback ||= decode(href[1])
  }
  return fallback
}

function dateOf(block) {
  const raw = tagText(block, 'pubDate') || tagText(block, 'published') || tagText(block, 'updated') || tagText(block, 'dc:date')
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

function dayInTokyo(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function excerpt(text) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= 220) return clean
  const cut = clean.slice(0, 220)
  const pause = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('. '))
  return `${(pause > 80 ? cut.slice(0, pause + 1) : cut).trim()}…`
}

function includesWord(haystack, word) {
  const needle = word.toLowerCase()
  if (/[^\u0000-\u007f]/.test(word) || needle.length > 3) return haystack.includes(needle)
  return new RegExp(`(?:^|[^a-z0-9])${needle}(?:[^a-z0-9]|$)`).test(haystack)
}

function matches(text) {
  const haystack = text.toLowerCase()
  const found = []
  for (const rule of rules) {
    for (const word of rule.words) {
      if (includesWord(haystack, word)) found.push({ category: rule.category, word })
    }
  }
  return found
}

function blocks(xml) {
  return [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((match) => match[2])
}

function slugFor(url) {
  return `auto-${createHash('sha1').update(url).digest('hex').slice(0, 10)}`
}

async function readPrevious() {
  try {
    return JSON.parse(await readFile(OUT, 'utf8'))
  } catch {
    return null
  }
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    headers: { 'user-agent': USER_AGENT, accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) throw new Error(`${response.status}`)
  const xml = await response.text()
  if (!/<(rss|feed|rdf:RDF)\b/i.test(xml)) throw new Error('not a feed')
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  const picked = []
  for (const block of blocks(xml)) {
    const rawTitle = tagText(block, 'title')
    const title = /^(v?\d+\.\d+)/i.test(rawTitle) ? `${feed.name} ${rawTitle}` : rawTitle
    const url = linkOf(block)
    const date = dateOf(block)
    if (!rawTitle || !url || !date || date.getTime() < cutoff) continue
    if (/todays_sales|yajiuma|dependabot/i.test(url + title)) continue
    const summary = excerpt(
      [tagText(block, 'description'), tagText(block, 'summary'), tagText(block, 'content'), tagText(block, 'content:encoded')]
        .sort((a, b) => b.length - a.length)[0] ?? '',
    )
    if (/release highlights could not be determined/i.test(summary)) continue
    const found = matches(`${title} ${summary}`)
    if (feed.mode === 'match' && found.length === 0) continue
    const category = found[0]?.category && categories.has(found[0].category) ? found[0].category : feed.category
    const words = [...new Set(found.map((item) => item.word))].slice(0, 3)
    const why = feed.mode === 'all'
      ? `${feed.name}の更新です。机の対象に入っているので、抜粋だけ置いています。続きは出典で確認できます。`
      : `「${words.join('、')}」に触れているので拾いました。全文の判断は出典を見てください。`
    picked.push({
      slug: slugFor(url),
      title,
      category,
      date: dayInTokyo(date),
      summary: summary || title,
      why,
      points: [],
      tags: words,
      source: { name: feed.name, url, kind: feed.kind },
      auto: true,
      sort: date.getTime(),
    })
    if (picked.length >= PER_FEED) break
  }
  return picked
}

const previous = await readPrevious()
const fresh = []
const errors = []

for (const feed of feeds) {
  try {
    const items = await fetchFeed(feed)
    fresh.push(...items)
    console.log(`${items.length}\t${feed.name}`)
  } catch (error) {
    errors.push(`${feed.name}: ${error instanceof Error ? error.message : error}`)
    console.warn(`skip\t${feed.name}\t${error instanceof Error ? error.message : error}`)
  }
}

const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000
const seen = new Set(fresh.map((item) => item.source.url))
const kept = (previous?.items ?? []).flatMap((item) => {
  if (!item?.source?.url || seen.has(item.source.url)) return []
  if (/release highlights could not be determined/i.test(item.summary ?? '')) return []
  const time = new Date(item.date).getTime()
  if (Number.isNaN(time) || time < cutoff) return []
  return [{ ...item, sort: time }]
})

const ranked = [...fresh, ...kept]
  .sort((a, b) => (b.sort ?? 0) - (a.sort ?? 0) || String(b.date).localeCompare(String(a.date)))
  .filter((item, index, list) => list.findIndex((other) => other.source.url === item.source.url) === index)

const perSource = new Map()
const items = []
for (const item of ranked) {
  const count = perSource.get(item.source.name) ?? 0
  if (count >= 2) continue
  perSource.set(item.source.name, count + 1)
  const { sort, ...rest } = item
  items.push(rest)
  if (items.length >= MAX_ITEMS) break
}

if (items.length === 0) {
  console.error(errors.join('\n') || 'no items')
  process.exit(previous ? 0 : 1)
}

const signature = (list) => JSON.stringify(list.map((item) => [item.slug, item.title, item.date, item.summary, item.source.url]))
if (previous && signature(previous.items ?? []) === signature(items)) {
  console.log('unchanged')
  process.exit(0)
}

const digest = {
  updatedAt: new Date().toISOString(),
  items,
}
await writeFile(OUT, `${JSON.stringify(digest, null, 2)}\n`)
console.log(`wrote ${items.length} items`)
