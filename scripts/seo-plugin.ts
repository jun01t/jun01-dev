import type { Plugin } from 'vite'
import { items } from '../src/data/items'
import digest from '../public/digest.json'
import { isItem } from '../src/lib/discovery.mjs'
import { canonicalUrl, escapeHtml, pageMetadata, renderPage } from './seo-lib.mjs'

export function seoPlugin(siteUrl: string): Plugin {
  return {
    name: 'desk-static-metadata',
    enforce: 'post',
    generateBundle(_, bundle) {
      const index = bundle['index.html']
      if (!index || index.type !== 'asset') throw new Error('Missing index.html')
      const template = String(index.source)
      const all = [...items, ...digest.items.filter(isItem)]
      const paths = ['', 'archive', 'lens', ...all.map(item => `items/${item.slug}`)]
      for (const path of [...new Set(paths)]) {
        const item = all.find(value => path === `items/${value.slug}`)
        const metadata = pageMetadata(`/${path}`, item)
        const e = escapeHtml
        const content = item ? `<main class="shell"><article class="article"><h1>${e(item.title)}</h1><p>公開 ${e(item.date)} · ${item.auto ? '公開フィードの抜粋' : '編集記事'}</p><p>${e(item.summary)}</p><ul>${item.points.map(point => `<li>${e(point)}</li>`).join('')}</ul><a href="${e(item.source.url)}">${e(item.source.name)}で元記事を読む</a></article></main>` : `<main class="shell"><h1>${e(metadata.title)}</h1><p>${e(metadata.description)}</p><ul>${all.map(item => `<li><a href="${canonicalUrl(siteUrl, `items/${item.slug}`) || `${path ? '../' : './'}items/${item.slug}/`}">${e(item.title)}</a></li>`).join('')}</ul></main>`
        const html = renderPage(template, metadata, canonicalUrl(siteUrl, path), content)
        if (!path) index.source = html
        else this.emitFile({ type: 'asset', fileName: `${path}/index.html`, source: html })
      }
      if (siteUrl) {
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map(path => `<url><loc>${escapeHtml(canonicalUrl(siteUrl, path))}</loc></url>`).join('')}</urlset>` })
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${canonicalUrl(siteUrl, 'sitemap.xml')}\n` : ''}` })
    },
  }
}
