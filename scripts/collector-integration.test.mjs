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
    return { ok: true, text: async () => '<rss><channel><item><title>Rails Claude Code モニター release</title><link>https://example.com/' + encodeURIComponent(url) + '</link><pubDate>' + new Date(Date.now() - 1000).toISOString() + '</pubDate><description>Rails release</description></item></channel></rss>' };
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
  assert.ok(digest.items.length > 0)
  assert.ok(digest.items.every(item => item.collectedAt && item.auto && item.source.url.startsWith('https:')))
  assert.equal(new Set(digest.items.map(item => item.source.url)).size, digest.items.length)
})
