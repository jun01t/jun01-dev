<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { itemBySlug, relatedItems } from '../data/catalog'
import { categoryOf, formatDate, safeHttpUrl, sourceKindLabel } from '../data/items'
import { scoreItem } from '../lib/discovery.mjs'
import { useInterests } from '../composables/useInterests'
import { useSaved } from '../composables/useSaved'

const route = useRoute()
const { has, toggle, persisted } = useSaved()
const item = computed(() => itemBySlug(String(route.params.slug)))
const related = computed(() => (item.value ? relatedItems(item.value.slug) : []))
const sourceUrl = computed(() => (item.value ? safeHttpUrl(item.value.source.url) : ''))

const { interests } = useInterests()
const importance = computed(() => item.value ? scoreItem(item.value, interests.value) : null)
const feedback = ref('')
function save() {
  if (!item.value) return
  toggle(item.value.slug)
  feedback.value = has(item.value.slug) ? '記事を保存しました。' : '保存を解除しました。'
}
</script>

<template>
  <div class="shell">
    <RouterLink class="back" to="/archive">アーカイブへ戻る</RouterLink>

    <p v-if="!item" class="empty">この記事はありません。</p>

    <div v-else class="detail">
      <article class="article">
        <p class="meta">
          <span class="mark" :class="item.category">{{ categoryOf(item.category).label }}</span>
          <time :datetime="item.date">公開 {{ formatDate(item.date) }}</time>
          <span class="mark auto">{{ item.auto ? '自動収集・原文の抜粋' : '手動編集' }}</span>
          <span v-if="item.collectedAt">初回収集 {{ formatDate(item.collectedAt) }}</span>
          <span>{{ sourceKindLabel[item.source.kind] }}</span>
        </p>
        <h1>{{ item.title }}</h1>
        <p v-if="importance" class="importance">注目度 {{ importance.score }} · {{ importance.reasons.join(' / ') || '通常の記事' }}</p>
        <p v-if="item.auto" class="meta">公開フィードの抜粋です。内容の詳細や適用条件は元記事で確認してください。</p>
        <div class="relation">
          <h2>この机との関係</h2>
          <p>{{ item.why }}</p>
        </div>
        <p>{{ item.summary }}</p>
        <div v-if="item.points.length" class="points">
          <h2>押さえる点</h2>
          <ol>
            <li v-for="point in item.points" :key="point">{{ point }}</li>
          </ol>
        </div>
        <p class="meta" style="margin-top: 1rem">
          <span v-for="tag in item.tags" :key="tag">#{{ tag }}</span>
        </p>
        <div class="actions">
          <a v-if="sourceUrl" class="primary" :href="sourceUrl" target="_blank" rel="noreferrer">{{ item.source.name }}を開く</a>
          <button class="save" type="button" :aria-pressed="has(item.slug)" @click="save">
            {{ has(item.slug) ? '保存済み' : '保存する' }}
          </button>
        </div>
        <p role="status" aria-live="polite">{{ feedback }}<template v-if="!persisted"> 保存領域が使えないため、この画面を閉じると保存は失われます。</template></p>
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
