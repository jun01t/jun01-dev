<script setup lang="ts">
import { computed } from 'vue'
import { useInterests } from '../composables/useInterests'
import { TOPICS, rankItems, ageInDays, topicsFor, scoreItem } from '../lib/discovery.mjs'
import ItemCard from '../components/ItemCard.vue'
import { getItems, getUpdatedAt, digestLoadFailed } from '../data/catalog'
import { categories, formatDate, issue, items } from '../data/items'

const { interests, persisted, toggle, reset } = useInterests()
const now = new Date()
const collected = computed(() => rankItems(getItems().filter(item => item.auto), interests.value, now))
const recent = computed(() => collected.value.filter(item => ageInDays(item, now) >= 0 && ageInDays(item, now) < 7))
const selected = computed(() => recent.value.filter(item => !interests.value.length || interests.value.some(id => topicsFor(item).includes(id))))
const top = computed(() => selected.value.slice(0, 3))
const shelves = computed(() => categories.map(category => ({ ...category, items: selected.value.filter(item => item.category === category.id).slice(0, 4) })))
const loadFailed = digestLoadFailed()
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
      <span>{{ issue.kicker }}</span>
    </p>
    <h1 class="display xl">机に置くものだけを、毎朝集めている。</h1>
    <p class="dek">
      Rails、Nuxt、React、Next.js、TypeScript、Vite、Cursor、Claude Code、Codex、ChatGPT、OpenAI、AWS、デスク周りの公開フィードから、キーワードが一致した抜粋です。収集にAPI料金はかかっていません。
      <template v-if="updatedAt">最終更新は {{ formatDate(updatedAt) }} です。</template>
    </p>

    <p v-if="loadFailed" class="empty" role="status">収集記事を読み込めませんでした。時間をおいてページを再読み込みしてください。編集記事は下から読めます。</p>

    <section class="preferences note" aria-labelledby="preferences-title">
      <h2 id="preferences-title">自分の机に、必要な話題を。</h2>
      <p class="meta">未選択ならすべて表示。選んだ関心に合わせて、直近7日の記事を絞り込みます。</p>
      <div class="filters">
        <button v-for="topic in TOPICS" :key="topic.id" type="button" class="chip" :aria-pressed="interests.includes(topic.id)" @click="toggle(topic.id)">{{ topic.label }}</button>
        <button type="button" class="text-button" @click="reset">リセット</button>
      </div>
      <p v-if="!persisted" role="status">設定はこの画面を開いている間だけ有効です。</p>
    </section>

    <div class="section-head">
      <h2>今日の重要ニュース TOP 3</h2>
      <RouterLink to="/archive?source=auto">収集記事をすべて見る</RouterLink>
    </div>
    <p class="meta">直近7日の公開記事から選定。順位は見出し・一次情報・関心による目安です。</p>
    <ol v-if="top.length" class="ranking">
      <li v-for="(item, index) in top" :key="item.slug">
        <p class="rank-label">{{ String(index + 1).padStart(2, '0') }} <span>{{ scoreItem(item, interests, now).reasons.join(' · ') }}</span></p>
        <ItemCard :item="item" />
      </li>
    </ol>
    <div v-else class="empty">
      <p>選択した関心に一致する直近7日の更新はありません。</p>
      <button v-if="interests.length" type="button" class="chip" @click="reset">すべての関心に戻す</button>
      <RouterLink to="/archive?source=auto">過去の収集を見る</RouterLink>
    </div>

    <div class="section-head"><h2>直近7日間の更新</h2><span class="meta">{{ selected.length }}件</span></div>
    <section v-for="shelf in shelves.filter(value => value.items.length)" :key="shelf.id" class="shelf">
      <div class="section-head"><h3>{{ shelf.label }}</h3><RouterLink :to="`/archive?source=auto&category=${shelf.id}`">一覧へ</RouterLink></div>
      <div class="grid"><ItemCard v-for="item in shelf.items" :key="item.slug" :item="item" /></div>
    </section>

    <div class="section-head" style="margin-top: 2.4rem">
      <h2>定点</h2>
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
      <RouterLink to="/archive">アーカイブへ</RouterLink>
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
}
</style>
