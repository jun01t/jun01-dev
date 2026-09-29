<script setup lang="ts">
import ItemCard from '../components/ItemCard.vue'
import { categories, formatDate, issue, items } from '../data/items'

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
    <h1 class="display xl">Nuxt 3はサポートが終わり、机の上は9月のCursorとRailsに寄っている。</h1>
    <p class="dek">
      日記に繰り返し出てくる Rails、Nuxt、Web Components、AWS、Cursor と、フルリモートの机に関係するものだけを短く置いています。
    </p>

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
