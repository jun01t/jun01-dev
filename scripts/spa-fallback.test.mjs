import assert from 'node:assert/strict'
import test from 'node:test'
import { collectSlugs } from './copy-spa-fallback.mjs'

test('route copies stay inside item slugs', () => {
  const slugs = collectSlugs(`slug: 'nuxt-3-eol'\nslug: '../secret'`, {
    items: [{ slug: 'auto-39d70b10c8' }, { slug: '../digest' }, { slug: 'ok-2' }],
  })
  assert.deepEqual(slugs.sort(), ['auto-39d70b10c8', 'nuxt-3-eol', 'ok-2'])
})
