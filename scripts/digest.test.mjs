import assert from 'node:assert/strict'
import test from 'node:test'
import { formatDate, safeHttpUrl, timestampInTokyo } from './digest-lib.mjs'
import { assembleItems, buildItem, planDigest } from './update-digest.mjs'

const gadgetFeed = {
  name: 'PC Watch',
  category: 'gadget',
  kind: 'roundup',
  mode: 'match',
}

const railsFeed = {
  name: 'Ruby on Rails',
  category: 'web',
  kind: 'primary',
  mode: 'all',
}

test('a morning run in Tokyo keeps that calendar day', () => {
  const instant = new Date('2026-09-29T23:00:00.000Z')
  assert.equal(timestampInTokyo(instant).slice(0, 10), '2026-09-30')
  assert.equal(formatDate('2026-09-29T23:00:00.000Z'), '2026.09.30')
  assert.equal(formatDate('2026-09-29'), '2026.09.29')
})

test('feed category stays put when another keyword appears first', () => {
  const now = new Date('2026-09-29T12:00:00Z')
  const item = buildItem(
    gadgetFeed,
    `
      <title>USB-CモニターとVue対応</title>
      <link>https://example.com/monitor</link>
      <pubDate>Tue, 29 Sep 2026 00:00:00 GMT</pubDate>
      <description>ディスプレイとLambdaの話</description>
    `,
    now,
  )
  assert.equal(item.category, 'gadget')
  assert.ok(item.tags.includes('vue'))

  const rails = buildItem(
    railsFeed,
    `
      <title>Cursor at Rails World</title>
      <link>https://example.com/rails</link>
      <pubDate>Tue, 29 Sep 2026 00:00:00 GMT</pubDate>
      <description>A note from the team.</description>
    `,
    now,
  )
  assert.equal(rails.category, 'web')
})

test('javascript urls are dropped', () => {
  const item = buildItem(
    railsFeed,
    `
      <title>Rails</title>
      <link>javascript:alert(1)</link>
      <pubDate>Tue, 29 Sep 2026 00:00:00 GMT</pubDate>
      <description>note</description>
    `,
    new Date('2026-09-29T12:00:00Z'),
  )
  assert.equal(item, null)
  assert.equal(safeHttpUrl('javascript:alert(1)'), '')
  assert.equal(safeHttpUrl('https://example.com/a'), 'https://example.com/a')
})

test('an empty collection replaces expired items', () => {
  const now = new Date('2026-09-29T12:00:00Z')
  const previous = {
    items: [
      {
        slug: 'old',
        title: 'Old',
        date: '2026-01-01',
        summary: 'stale',
        category: 'web',
        source: { name: 'Ruby on Rails', url: 'https://example.com/old' },
      },
    ],
  }
  const items = assembleItems([], previous.items, now)
  assert.deepEqual(items, [])
  assert.deepEqual(planDigest(previous, items), { write: true, exitCode: 0 })
  assert.deepEqual(planDigest(null, []), { write: false, exitCode: 1 })
})

test('openai product notes stay and unrelated posts drop', () => {
  const feed = {
    name: 'OpenAI',
    category: 'ai',
    kind: 'primary',
    mode: 'match',
    words: ['chatgpt', 'gpt', 'sora', 'codex'],
  }
  const now = new Date('2026-09-29T12:00:00Z')
  const kept = buildItem(
    feed,
    `
      <title>Introducing GPT-6.1 Sol</title>
      <link>https://openai.com/index/gpt-6-1</link>
      <pubDate>Tue, 29 Sep 2026 10:00:00 GMT</pubDate>
      <description>A new model for ChatGPT and the API.</description>
    `,
    now,
  )
  assert.equal(kept.category, 'ai')
  assert.ok(kept.tags.includes('chatgpt'))
  assert.equal(kept.tags.includes('gpt'), false)

  const dropped = buildItem(
    feed,
    `
      <title>Helping small businesses put AI to work</title>
      <link>https://openai.com/index/small-business</link>
      <pubDate>Wed, 30 Sep 2026 10:00:00 GMT</pubDate>
      <description>OpenAI is expanding a grant program for local shops.</description>
    `,
    now,
  )
  assert.equal(dropped, null)
})

test('desk roundups skip chatgpt unless a desk word is present', () => {
  const feed = {
    name: 'PC Watch',
    category: 'gadget',
    kind: 'roundup',
    mode: 'match',
    words: ['モニター', 'キーボード'],
  }
  const item = buildItem(
    feed,
    `
      <title>ChatGPTの新しいモデル</title>
      <link>https://example.com/chatgpt</link>
      <pubDate>Tue, 29 Sep 2026 00:00:00 GMT</pubDate>
      <description>AnthropicとOpenAIの比較。</description>
    `,
    new Date('2026-09-29T12:00:00Z'),
  )
  assert.equal(item, null)
})

test('a feed outage keeps items still inside the window', () => {
  const now = new Date('2026-09-29T12:00:00Z')
  const previousItems = [
    {
      slug: 'recent',
      title: 'Recent',
      date: '2026-09-20',
      summary: 'still here',
      category: 'web',
      source: { name: 'Ruby on Rails', url: 'https://example.com/recent' },
    },
  ]
  const items = assembleItems([], previousItems, now, new Set(['Ruby on Rails']))
  assert.equal(items.length, 1)
  assert.equal(items[0].slug, 'recent')
  assert.deepEqual(planDigest({ items: previousItems }, items), { write: false, exitCode: 0 })
})

test('all feed failures are errors even when the previous data is unchanged', () => {
  assert.deepEqual(planDigest({ items: [] }, [], true), { write: false, exitCode: 1 })
})
test('Atom alternate links, CDATA and invalid entities are handled safely', () => {
  const now = new Date('2026-10-10T12:00:00Z')
  const item = buildItem(railsFeed, `<title>Rails &#99999999;</title><link rel='self' href='https://example.com/feed'/><link rel='alternate' href='https://example.com/article?utm_source=rss'/><published>2026-10-10T00:00:00Z</published>`, now)
  assert.equal(item.source.url, 'https://example.com/article')
  assert.ok(item.title.includes('�'))
  const cdata = buildItem(railsFeed, `<title>Rails</title><link><![CDATA[https://example.com/a]]></link><pubDate>2026-10-10</pubDate>`, now)
  assert.equal(cdata.source.url, 'https://example.com/a')
})
test('normalization deduplicates tracking URLs and preserves existing slugs and collection dates', () => {
  const now = new Date('2026-10-10T12:00:00Z')
  const fresh = buildItem(railsFeed, `<title>Rails</title><link>https://example.com/a?utm_source=new</link><pubDate>2026-10-10</pubDate>`, now)
  const previous = { ...fresh, slug: 'old-bookmarked-slug', collectedAt: '2026-10-09T12:00:00+09:00', source: { ...fresh.source, url: 'https://example.com/a?utm_source=old' } }
  const items = assembleItems([fresh, { ...fresh }], [previous], now)
  assert.equal(items.length, 1)
  assert.equal(items[0].slug, previous.slug)
  assert.equal(items[0].collectedAt, previous.collectedAt)
})
test('future publication dates and URLs containing credentials are rejected', () => {
  const now = new Date('2026-10-10T12:00:00Z')
  assert.equal(buildItem(railsFeed, '<title>Rails</title><link>https://example.com/a</link><pubDate>2026-10-12</pubDate>', now), null)
  assert.equal(safeHttpUrl('https://user:pass@example.com/a'), '')
})
