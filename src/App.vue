<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue'
import { issue, formatDate } from './data/items'
</script>

<template>
  <a class="skip" href="#main">本文へ</a>
  <SiteHeader />
  <main id="main">
    <RouterView />
  </main>
  <footer class="site-footer">
    <div class="shell">
      <p>机上 第{{ issue.number }}号 · {{ formatDate(issue.published) }} 時点の公開情報を要約しています。</p>
      <p>ガジェットは公開記事の要約です。価格と仕様は購入前に確認してください。</p>
    </div>
  </footer>
</template>
