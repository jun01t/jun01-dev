import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ArchiveView from './views/ArchiveView.vue'
import DetailView from './views/DetailView.vue'
import LensView from './views/LensView.vue'
import { itemBySlug } from './data/catalog'
import { canonicalUrl, pageMetadata } from '../scripts/seo-lib.mjs'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.path === from.path) return false
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '今週' } },
    { path: '/archive', name: 'archive', component: ArchiveView, meta: { title: 'アーカイブ' } },
    { path: '/items/:slug', name: 'item', component: DetailView, meta: { title: '記事' } },
    { path: '/lens', name: 'lens', component: LensView, meta: { title: '視点' } },
  ],
})

router.afterEach((to) => {
  const item = to.name === 'item' ? itemBySlug(String(to.params.slug)) : undefined
  const metadata = pageMetadata(to.path, item)
  document.title = metadata.title
  const setMeta = (key: string, value: string, property = false) => {
    const attribute = property ? 'property' : 'name'
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
    if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.append(element) }
    element.content = value
  }
  setMeta('description', metadata.description)
  setMeta('og:title', metadata.title, true)
  setMeta('og:description', metadata.description, true)
  setMeta('og:type', metadata.type, true)
  setMeta('robots', to.name === 'item' && !item ? 'noindex' : 'index,follow')
  const base = import.meta.env.VITE_SITE_URL || new URL(import.meta.env.BASE_URL, location.origin).href
  const canonical = canonicalUrl(base, to.path)
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.append(link) }
  link.href = canonical
  setMeta('og:url', canonical, true)
})
