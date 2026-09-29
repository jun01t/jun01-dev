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
  const items = assembleItems([], previousItems, now)
  assert.equal(items.length, 1)
  assert.equal(items[0].slug, 'recent')
  assert.deepEqual(planDigest({ items: previousItems }, items), { write: false, exitCode: 0 })
})
