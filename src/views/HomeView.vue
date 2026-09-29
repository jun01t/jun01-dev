<script setup lang="ts">
import ItemCard from '../components/ItemCard.vue'
import { getItems, getUpdatedAt } from '../data/catalog'
import { categories, formatDate, issue, items } from '../data/items'

const collected = getItems()
  .filter((item) => item.auto)
  .sort((a, b) => (a.date < b.date ? 1 : -1))
const updatedAt = getUpdatedAt()
const lead = items.find((item) => item.lead)
const side = items.find((item) => item.side)
const rest = items
  .filter((item) => !item.lead && !item.side && item.category !== 'gadget')
  .sort((a, b) => (a.date < b.date ? 1 : -1))
const gadgets = items
  .filter((item) => item.category === 'gadget')
  .sort((a, b) => (a.date < b.date ? 1 : -1))
</script>

<template>
  <div class="shell">
    <p class="kicker">
      <span>第{{ issue.number }}号</span>
      <span>{{ formatDate(issue.published) }}</span>
      <span>{{ issue.kicker }}</span>
    </p>
    <h1 class="display xl">机に置くものだけを、毎朝集めている。</h1>
    <p class="dek">
      Rails、Nuxt、Cursor、AWS、デスク周りの公開フィードから、キーワードが一致した抜粋です。収集にAPI料金はかかっていません。
      <template v-if="updatedAt">最終更新は {{ formatDate(updatedAt) }} です。</template>
    </p>

    <div class="section-head">
      <h2>今日の収集</h2>
      <RouterLink to="/archive?source=auto">収集だけ見る</RouterLink>
    </div>
    <div v-if="collected.length" class="grid">
      <ItemCard v-for="item in collected.slice(0, 6)" :key="item.slug" :item="item" />
    </div>
    <p v-else class="empty">この期間に一致する新しい更新はありません。下の定点を見てください。</p>

    <div class="section-head" style="margin-top: 2.4rem">
      <h2>定点</h2>
      <span class="meta">第{{ issue.number }}号</span>
    </div>

    <div v-if="lead && side" class="lead-grid">
      <ItemCard :item="lead" featured="lead" />
      <ItemCard :item="side" featured="side" />
    </div>

    <div class="filters" aria-label="分類">
      <RouterLink
        v-for="category in categories"
        :key="category.id"
        class="chip"
        :to="`/archive?category=${category.id}`"
      >
        {{ category.label }}
        <span class="chip-note">{{ category.blurb }}</span>
      </RouterLink>
    </div>

    <div class="section-head">
      <h2>技術</h2>
      <RouterLink to="/archive?category=web">アーカイブへ</RouterLink>
    </div>
    <div class="stream">
      <ItemCard v-for="item in rest" :key="item.slug" :item="item" />
    </div>

    <div class="section-head" style="margin-top: 2.4rem">
      <h2>机</h2>
      <RouterLink to="/archive?category=gadget">ガジェットだけ見る</RouterLink>
    </div>
    <div class="grid">
      <ItemCard v-for="item in gadgets" :key="item.slug" :item="item" />
    </div>
  </div>
</template>

<style scoped>
.chip-note {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0;
  opacity: 0.8;
}

.filters .chip {
  text-align: left;
  border-radius: 0.9rem;
  background: var(--paper);
}
</style>
