import assert from 'node:assert/strict'
import test from 'node:test'
import { ageInDays, filterItems, isItem, rankItems, scoreItem, topicsFor } from '../src/lib/discovery.mjs'
import { normalizeInterests, readInterests, writeInterests } from '../src/composables/preferences-store.mjs'
const now = new Date('2026-10-10T03:00:00Z')
const item = { slug: 'rails', title: 'Rails 8.1 released', category: 'web', date: '2026-10-10', summary: 'A release', why: 'Web development', tags: ['Rails'], points: [], source: { name: 'Rails', url: 'https://rubyonrails.org/news', kind: 'primary' }, auto: true }

test('ranking is deterministic and does not mutate its input', () => {
  const other = { ...item, slug: 'aaa' }
  const input = [item, other]
  assert.deepEqual(rankItems(input, [], now).map(item => item.slug), ['aaa', 'rails'])
  assert.equal(input[0], item)
})
test('explicit security patches rank above a normal same-day release', () => {
  const patch = { ...item, slug: 'patch', title: 'Rails security patch CVE-2026-12345' }
  assert.equal(rankItems([item, patch], [], now)[0].slug, 'patch')
  assert.ok(scoreItem(patch, [], now).reasons.includes('セキュリティ修正の可能性'))
})
test('generic security product branding and summary keywords do not count as a patch', () => {
  const product = { ...item, title: 'Introducing Security Review', summary: 'Security patch CVE-2026-12345' }
  assert.ok(!scoreItem(product, [], now).reasons.includes('セキュリティ修正の可能性'))
})
test('future and stale dates have no freshness boost, with Tokyo day boundaries', () => {
  assert.equal(ageInDays({ ...item, date: '2026-10-11' }, new Date('2026-10-10T15:00:00Z')), 0)
  for (const date of ['2026-10-11', '2026-10-03', '2026-10-01']) assert.ok(!scoreItem({ ...item, date }, [], now).reasons.includes('直近7日'))
})
test('interests distinguish Rails and frontend without changing category IDs', () => {
  assert.deepEqual(topicsFor(item), ['rails'])
  assert.ok(scoreItem(item, ['rails'], now).score > scoreItem(item, ['frontend'], now).score)
})
test('search combines terms, saved status, source, and category', () => {
  assert.deepEqual(filterItems([item], { query: ' RAILS  release ', category: 'web', savedOnly: true, saved: ['rails'], autoOnly: true }), [item])
  assert.deepEqual(filterItems([item], { savedOnly: true, saved: [] }), [])
  assert.deepEqual(filterItems([item], { category: 'ai' }), [])
})
test('untrusted digest schema rejects malformed arrays, dates and unsafe URLs', () => {
  assert.equal(isItem(item), true)
  for (const value of [null, { ...item, tags: null }, { ...item, points: [1] }, { ...item, date: '2026-02-30' }, { ...item, slug: '../secret' }, { ...item, category: 'other' }, { ...item, source: { ...item.source, url: 'javascript:alert(1)' } }]) assert.equal(isItem(value), false)
})
test('preferences tolerate corrupt or unavailable storage and exclude unknown topics', () => {
  assert.deepEqual(normalizeInterests(['rails', 'rails', 'bogus', 1]), ['rails'])
  assert.deepEqual(readInterests({ getItem: () => '{bad' }), [])
  assert.deepEqual(readInterests(undefined), [])
  assert.equal(writeInterests(undefined, ['rails']), false)
  let saved
  assert.equal(writeInterests({ setItem: (_key, value) => { saved = value } }, ['rails']), true)
  assert.deepEqual(readInterests({ getItem: () => saved }), ['rails'])
})
