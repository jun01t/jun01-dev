import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
const execute = promisify(execFile)
async function fixture(t, mode) {
  const directory = await mkdtemp(join(tmpdir(), 'desk-collector-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  for (const dir of ['scripts', 'public', 'src/lib']) await mkdir(join(directory, dir), { recursive: true })
  for (const file of ['scripts/update-digest.mjs', 'scripts/digest-lib.mjs', 'src/lib/discovery.mjs']) await copyFile(new URL(`../${file}`, import.meta.url), join(directory, file))
  const original = JSON.stringify({ updatedAt: '2026-01-01', items: [] })
  await writeFile(join(directory, 'public/digest.json'), original)
  await writeFile(join(directory, 'mock.mjs'), `globalThis.fetch = async url => {
    if (${JSON.stringify(mode)} === 'failure' || String(url).includes('cursor.com')) throw new Error('fixture outage');
    const entries = Array.from({ length: 10 }, (_, index) => '<item><title>Rails Claude Code モニター release ' + index + '</title><link>https://example.com/' + encodeURIComponent(url) + '/' + index + '</link><pubDate>' + new Date(Date.now() - (index + 1) * 1000).toISOString() + '</pubDate><description>Rails Claude Code Nuxt Vue AWS ChatGPT GPT Codex monitor release ' + index + '</description></item>').join('');
    return { ok: true, text: async () => '<rss><channel>' + entries + '</channel></rss>' };
  };`)
  return { directory, original, run: () => execute(process.execPath, ['--import', './mock.mjs', './scripts/update-digest.mjs'], { cwd: directory }) }
}
test('collector CLI leaves previous bytes untouched and exits nonzero when all feeds fail', async t => {
  const context = await fixture(t, 'failure')
  await assert.rejects(context.run(), error => error.code === 1)
  assert.equal(await readFile(join(context.directory, 'public/digest.json'), 'utf8'), context.original)
})
test('collector CLI completes after a partial outage and produces valid dated items', async t => {
  const context = await fixture(t, 'partial')
  await context.run()
  const digest = JSON.parse(await readFile(join(context.directory, 'public/digest.json'), 'utf8'))
  assert.ok(digest.items.length > 18)
  assert.ok(digest.items.length <= 36)
  assert.ok(digest.items.some(item => item.category === 'web'))
  assert.ok(digest.items.some(item => item.category === 'ai'))
  const bySource = new Map()
  for (const item of digest.items) bySource.set(item.source.name, (bySource.get(item.source.name) ?? 0) + 1)
  assert.ok([...bySource.values()].every(count => count <= 4))
  assert.ok(digest.items.every(item => item.collectedAt && item.auto && item.source.url.startsWith('https:')))
  assert.equal(new Set(digest.items.map(item => item.source.url)).size, digest.items.length)
})
