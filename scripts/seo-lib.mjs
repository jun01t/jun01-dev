export const DEFAULT_DESCRIPTION = 'ウェブ技術、AI開発、クラウドとガジェットの更新を、公開フィードから短時間で確認できる技術ダイジェスト。'
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}
export function canonicalUrl(siteUrl, path = '') {
  if (!siteUrl) return ''
  const base = new URL(siteUrl)
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) throw new Error('SITE_URL must be an HTTP(S) URL')
  base.search = ''; base.hash = ''
  if (!base.pathname.endsWith('/')) base.pathname += '/'
  return new URL(path.replace(/^\/+/, ''), base).href
}
export function pageMetadata(path, item) {
  return {
    title: item ? `${item.title} · 机上` : path.startsWith('/items/') ? '見つかりません · 机上' : path === '/archive' ? 'アーカイブ · 机上' : path === '/lens' ? '視点 · 机上' : '机上 · jun01 desk',
    description: item?.summary || DEFAULT_DESCRIPTION,
    type: item ? 'article' : 'website',
  }
}
export function renderPage(html, metadata, canonical = '', content = '') {
  const e = escapeHtml
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${e(metadata.title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?>/i, '')
    .replace('</head>', `<meta name="description" content="${e(metadata.description)}">\n<meta property="og:title" content="${e(metadata.title)}">\n<meta property="og:description" content="${e(metadata.description)}">\n<meta property="og:type" content="${metadata.type}">\n<meta property="og:locale" content="ja_JP">\n${canonical ? `<link rel="canonical" href="${e(canonical)}"><meta property="og:url" content="${e(canonical)}">` : ''}\n</head>`)
    .replace('<div id="app"></div>', `<div id="app">${content}</div>`)
}
