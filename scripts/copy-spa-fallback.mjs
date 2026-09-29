import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const SLUG = /^[A-Za-z0-9-]+$/

export function collectSlugs(editorialSource, digest) {
  const slugs = new Set()
  for (const item of digest?.items ?? []) {
    if (typeof item?.slug === 'string' && SLUG.test(item.slug)) slugs.add(item.slug)
  }
  for (const match of String(editorialSource).matchAll(/slug:\s*'([A-Za-z0-9-]+)'/g)) {
    slugs.add(match[1])
  }
  return [...slugs]
}

function copyRoute(dist, routePath) {
  const target = join(dist, routePath, 'index.html')
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(join(dist, 'index.html'), target)
}

function main() {
  const dist = 'dist'
  const index = join(dist, 'index.html')
  copyFileSync(index, join(dist, '404.html'))
  copyRoute(dist, 'archive')
  copyRoute(dist, 'lens')
  const digest = JSON.parse(readFileSync('public/digest.json', 'utf8'))
  const editorial = readFileSync('src/data/items.ts', 'utf8')
  for (const slug of collectSlugs(editorial, digest)) {
    copyRoute(dist, join('items', slug))
  }
}

const isDirect = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isDirect) main()
