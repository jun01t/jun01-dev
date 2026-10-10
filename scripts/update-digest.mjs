import { isItem } from '../src/lib/discovery.mjs'
import { createHash } from 'node:crypto'
import { readFile, writeFile, rename } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { cutoffDay, dayInTokyo, safeHttpUrl, timestampInTokyo, normalizeUrl } from './digest-lib.mjs'

const OUT = new URL('../public/digest.json', import.meta.url)
const MAX_AGE_DAYS = 21
const MAX_ITEMS = 36
const PER_FEED = 8
const USER_AGENT = 'jun01-desk/1.0 (+https://blog.jun01t.com)'

const gadgetWords = ['モニター', 'キーボード', 'マウス', 'デスク', 'ガジェット', 'ロジクール', 'logicool', 'benq', 'kvm', 'usb-c', 'usb type-c', 'ドッキング', '在宅', 'ディスプレイ', 'トラックボール']

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
    name: 'OpenAI',
    url: 'https://openai.com/news/rss.xml',
    category: 'ai',
    kind: 'primary',
    mode: 'match',
    words: ['chatgpt', 'gpt', 'sora', 'codex'],
  },
  {
    name: 'Claude Platform',
    url: 'https://platform.claude.com/docs/en/release-notes/feed.xml',
    category: 'ai',
    kind: 'primary',
    mode: 'all',
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
    name: 'TypeScript Blog',
    url: 'https://devblogs.microsoft.com/typescript/feed/',
    category: 'web',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'React Releases',
    url: 'https://github.com/facebook/react/releases.atom',
    category: 'web',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'Vite Releases',
    url: 'https://github.com/vitejs/vite/releases.atom',
    category: 'web',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'Next.js Releases',
    url: 'https://github.com/vercel/next.js/releases.atom',
    category: 'web',
    kind: 'primary',
    mode: 'all',
  },
  {
    name: 'OpenAI Node SDK Releases',
    url: 'https://github.com/openai/openai-node/releases.atom',
    category: 'ai',
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
    words: gadgetWords,
  },
]

const rules = [
  { category: 'ai', words: ['cursor', 'claude code', 'claude', 'codex', 'chatgpt', 'openai', 'anthropic', 'gpt', 'mcp', 'model context protocol'] },
  { category: 'cloud', words: ['terraform', 'rds', 'aurora', 'cloudfront', 'postgresql', 'route 53', 'route53', 'lambda', 'ecs'] },
  { category: 'web', words: ['nuxt', 'vue', 'react', 'next.js', 'nextjs', 'rails', 'ruby on rails', 'vite', 'web components', 'typescript', 'javascript', 'node.js'] },
  { category: 'gadget', words: gadgetWords },
]

function safeCodePoint(code) {
  return Number.isInteger(code) && code >= 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '�'
}

function decode(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, code) => safeCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => safeCodePoint(parseInt(code, 16)))
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
  const text = block.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i)
  if (text) return decode(text[1].trim()).trim()
  const tags = [...block.matchAll(/<link\b([^>]*)\/?>/gi)]
  for (const tag of tags) {
    const href = tag[1].match(/\bhref=["']([^"']+)["']/i)
    if (!href) continue
    const rel = tag[1].match(/\brel=["']([^"']+)["']/i)
    if (!rel || rel[1] === 'alternate') return decode(href[1])
    // Atom self/enclosure links are not article URLs.
  }
  return ''
}

function dateOf(block) {
  const raw = tagText(block, 'pubDate') || tagText(block, 'published') || tagText(block, 'updated') || tagText(block, 'dc:date')
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
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

function matches(text, words) {
  const haystack = text.toLowerCase()
  const found = []
  if (words) {
    for (const word of words) {
      if (includesWord(haystack, word)) found.push({ word })
    }
    return found
  }
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
    const data = JSON.parse(await readFile(OUT, 'utf8'))
    if (!data || !Array.isArray(data.items) || !data.items.every(isItem)) throw new Error('Invalid digest')
    return data
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw new Error('Previous digest could not be read; refusing to overwrite it', { cause: error })
  }
}

export function buildItem(feed, block, now = new Date()) {
  const rawTitle = tagText(block, 'title')
  const title = /^(v?\d+\.\d+)/i.test(rawTitle) ? `${feed.name} ${rawTitle}` : rawTitle
  const rawUrl = safeHttpUrl(linkOf(block))
  const url = normalizeUrl(rawUrl)
  const date = dateOf(block)
  if (!rawTitle || !url || !date || date.getTime() > now.getTime() || dayInTokyo(date) < cutoffDay(now, MAX_AGE_DAYS)) return null
  if (/todays_sales|yajiuma|dependabot/i.test(url + title)) return null
  const summary = excerpt(
    [tagText(block, 'description'), tagText(block, 'summary'), tagText(block, 'content'), tagText(block, 'content:encoded')]
      .sort((a, b) => b.length - a.length)[0] ?? '',
  )
  if (/release highlights could not be determined/i.test(summary)) return null
  const found = matches(`${title} ${summary}`, feed.words)
  if (feed.mode === 'match' && found.length === 0) return null
  const words = [...new Set(found.map((item) => item.word))]
    .filter((word, _, list) => !list.some((other) => other !== word && other.includes(word)))
    .slice(0, 3)
  const why = feed.mode === 'all'
    ? `${feed.name}の更新です。机の対象に入っているので、抜粋だけ置いています。続きは出典で確認できます。`
    : `「${words.join('、')}」に触れているので拾いました。全文の判断は出典を見てください。`
  return {
    slug: slugFor(rawUrl),
    title,
    category: feed.category,
    date: dayInTokyo(date),
    collectedAt: timestampInTokyo(now),
    summary: summary || title,
    why,
    points: [],
    tags: words,
    source: { name: feed.name, url, kind: feed.kind },
    auto: true,
    sort: date.getTime(),
  }
}

async function fetchFeed(feed, now) {
  const response = await fetch(feed.url, {
    headers: { 'user-agent': USER_AGENT, accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) throw new Error(`${response.status}`)
  const xml = await response.text()
  if (!/<(rss|feed|rdf:RDF)\b/i.test(xml)) throw new Error('not a feed')
  const picked = []
  for (const block of blocks(xml)) {
    const item = buildItem(feed, block, now)
    if (!item) continue
    picked.push(item)
  }
  return picked.sort((a, b) => b.sort - a.sort).slice(0, PER_FEED)
}

export function assembleItems(fresh, previousItems, now = new Date(), failedSources = new Set()) {
  const cutoff = cutoffDay(now, MAX_AGE_DAYS)
  const previousByUrl = new Map((Array.isArray(previousItems) ? previousItems : []).filter(item => item?.source?.url).map(item => [normalizeUrl(item.source.url), item]))
  fresh = fresh.map(item => {
    const previous = previousByUrl.get(normalizeUrl(item.source.url))
    return previous ? { ...item, slug: previous.slug, collectedAt: previous.collectedAt } : item
  })
  const seen = new Set(fresh.map((item) => normalizeUrl(item.source.url)))
  const kept = (previousItems ?? []).flatMap((item) => {
    if (!safeHttpUrl(item?.source?.url) || seen.has(normalizeUrl(item.source.url))) return []
    if (/release highlights could not be determined/i.test(item.summary ?? '')) return []
    if (typeof item.date !== 'string' || item.date < cutoff || !Number.isFinite(Date.parse(item.date)) || Date.parse(item.date) > now.getTime()) return []
    const time = Date.parse(item.date)
    return [{ ...item, sort: Number.isNaN(time) ? 0 : time }]
  })

  const ranked = [...fresh, ...kept]
    .sort((a, b) => (b.sort ?? 0) - (a.sort ?? 0) || String(b.date).localeCompare(String(a.date)))
    .filter((item, index, list) => list.findIndex((other) => normalizeUrl(other.source.url) === normalizeUrl(item.source.url)) === index)

  const perSource = new Map()
  const items = []
  for (const item of ranked) {
    const count = perSource.get(item.source.name) ?? 0
    if (count >= 4) continue
    perSource.set(item.source.name, count + 1)
    const { sort, ...rest } = item
    items.push(rest)
    if (items.length >= MAX_ITEMS) break
  }
  return items
}

export function signature(list) {
  return JSON.stringify(list.map((item) => [item.slug, item.title, item.date, item.summary, item.category, item.source.url]))
}

export function planDigest(previous, items, allFailed = false) {
  if (allFailed) return { write: false, exitCode: 1 }
  if (items.length === 0 && !previous) return { write: false, exitCode: 1 }
  if (previous && signature(previous.items ?? []) === signature(items)) return { write: false, exitCode: 0 }
  return { write: true, exitCode: 0 }
}

async function main() {
  const now = new Date()
  const previous = await readPrevious()
  const fresh = []
  const errors = []
  const failedSources = new Set()

  for (const feed of feeds) {
    try {
      const items = await fetchFeed(feed, now)
      fresh.push(...items)
      console.log(`${items.length}\t${feed.name}`)
    } catch (error) {
      failedSources.add(feed.name)
      errors.push(`${feed.name}: ${error instanceof Error ? error.message : error}`)
      console.warn(`skip\t${feed.name}\t${error instanceof Error ? error.message : error}`)
    }
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, `## Digest collection\n\nSucceeded: ${feeds.length - errors.length}/${feeds.length} feeds\n\n${errors.map(error => `- ${error}`).join('\n')}\n`, { flag: 'a' })
  }
  const items = assembleItems(fresh, previous?.items, now, failedSources)
  if (!items.every(isItem)) throw new Error('Invalid collected item; refusing to overwrite digest')
  const plan = planDigest(previous, items, errors.length === feeds.length)
  if (!plan.write) {
    if (plan.exitCode !== 0) console.error(errors.join('\n') || 'no items')
    else console.log('unchanged')
    process.exit(plan.exitCode)
  }

  const digest = {
    updatedAt: timestampInTokyo(now),
    items,
  }
  const temporary = new URL('../public/digest.json.tmp', import.meta.url)
  await writeFile(temporary, `${JSON.stringify(digest, null, 2)}\n`)
  await rename(temporary, OUT)
  console.log(`wrote ${items.length} items`)
}

const isDirect = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isDirect) await main()
