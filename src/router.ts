import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ArchiveView from './views/ArchiveView.vue'
import DetailView from './views/DetailView.vue'
import LensView from './views/LensView.vue'

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
  const page = typeof to.meta.title === 'string' ? to.meta.title : '机上'
  document.title = page === '今週' ? '机上 · jun01 desk' : `${page} · 机上`
})
