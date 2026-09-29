<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { categoryOf, formatDate, itemBySlug, relatedItems, sourceKindLabel } from '../data/items'
import { useSaved } from '../composables/useSaved'

const route = useRoute()
const { has, toggle } = useSaved()
const item = computed(() => itemBySlug(String(route.params.slug)))
const related = computed(() => (item.value ? relatedItems(item.value.slug) : []))

watchEffect(() => {
  document.title = item.value ? `${item.value.title} · 机上` : '見つかりません · 机上'
})
</script>

<template>
  <div class="shell">
    <RouterLink class="back" to="/archive">アーカイブへ戻る</RouterLink>

    <p v-if="!item" class="empty">この記事はありません。</p>

    <div v-else class="detail">
      <article class="article">
        <p class="meta">
          <span class="mark" :class="item.category">{{ categoryOf(item.category).label }}</span>
          <time :datetime="item.date">{{ formatDate(item.date) }}</time>
          <span>{{ sourceKindLabel[item.source.kind] }}</span>
        </p>
        <h1>{{ item.title }}</h1>
        <div class="relation">
          <h2>この机との関係</h2>
          <p>{{ item.why }}</p>
        </div>
        <p>{{ item.summary }}</p>
        <div class="points">
          <h2>押さえる点</h2>
          <ol>
            <li v-for="point in item.points" :key="point">{{ point }}</li>
          </ol>
        </div>
        <p class="meta" style="margin-top: 1rem">
          <span v-for="tag in item.tags" :key="tag">#{{ tag }}</span>
        </p>
        <div class="actions">
          <a class="primary" :href="item.source.url" target="_blank" rel="noreferrer">{{ item.source.name }}を開く</a>
          <button class="save" type="button" :aria-pressed="has(item.slug)" @click="toggle(item.slug)">
            {{ has(item.slug) ? '保存済み' : '保存する' }}
          </button>
        </div>
      </article>

      <aside class="aside">
        <h2>同じ棚</h2>
        <RouterLink v-for="other in related" :key="other.slug" :to="`/items/${other.slug}`">
          <strong>{{ other.title }}</strong>
          <span class="meta">{{ formatDate(other.date) }}</span>
        </RouterLink>
        <p v-if="!related.length" class="meta">近くの記事はまだありません。</p>
      </aside>
    </div>
  </div>
</template>
