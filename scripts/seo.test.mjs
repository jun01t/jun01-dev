import assert from 'node:assert/strict'
import test from 'node:test'
import { canonicalUrl, pageMetadata, renderPage } from './seo-lib.mjs'

test('canonical URLs preserve the GitHub Pages base path', () => {
  assert.equal(canonicalUrl('https://example.com/jun01-dev', '/items/test'), 'https://example.com/jun01-dev/items/test')
  assert.equal(canonicalUrl('', '/items/test'), '')
  assert.throws(() => canonicalUrl('javascript:alert(1)', '/'))
})
test('static metadata escapes source content and is article-specific', () => {
  const metadata = pageMetadata('/items/test', { title: '<script>bad</script>', summary: '" & <test>' })
  const html = renderPage('<head><title>old</title><meta name="description" content="old"></head><div id="app"></div>', metadata, 'https://example.com/items/test')
  assert.ok(html.includes('&lt;script&gt;'))
  assert.ok(!html.includes('<script>bad'))
  assert.equal((html.match(/name="description"/g) || []).length, 1)
  assert.ok(html.includes('property="og:type" content="article"'))
})
