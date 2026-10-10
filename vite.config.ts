import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { seoPlugin } from './scripts/seo-plugin'

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env

export default defineConfig({
  base: env?.PAGES_BASE || '/',
  plugins: [vue(), seoPlugin(env?.SITE_URL || '')],
  define: { 'import.meta.env.VITE_SITE_URL': JSON.stringify(env?.SITE_URL || '') },
})
