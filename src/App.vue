<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue'
import { getUpdatedAt } from './data/catalog'
import { formatDate } from './data/items'

const updatedAt = getUpdatedAt()
</script>

<template>
  <a class="skip" href="#main">本文へ</a>
  <SiteHeader />
  <main id="main">
    <RouterView />
  </main>
  <footer class="site-footer">
    <div class="shell">
      <p>
        机上
        <template v-if="updatedAt"> · 収集 {{ formatDate(updatedAt) }}</template>
      </p>
      <p>収集は公開フィードの抜粋です。価格と仕様は購入前に確認してください。</p>
    </div>
  </footer>
</template>
