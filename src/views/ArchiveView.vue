<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ItemCard from '../components/ItemCard.vue'
import { getItems } from '../data/catalog'
import { categories, type CategoryId } from '../data/items'
import { filterItems } from '../lib/discovery.mjs'
import { useSaved } from '../composables/useSaved'

const route = useRoute()
const router = useRouter()
const { slugs } = useSaved()
const search = ref(typeof route.query.q === 'string' ? route.query.q : '')

const category = computed(() => {
  const value = route.query.category
  return categories.some((item) => item.id === value) ? (value as CategoryId) : ''
})

const savedOnly = computed(() => route.query.saved === '1')
const autoOnly = computed(() => route.query.source === 'auto')

let timer: ReturnType<typeof setTimeout> | undefined
const composing = ref(false)
const appliedSearch = ref(search.value)
function startComposition() { composing.value = true; clearTimeout(timer) }
function endComposition() { composing.value = false; scheduleSearch() }
function scheduleSearch() {
  clearTimeout(timer)
  if (composing.value) return
  timer = setTimeout(() => {
    appliedSearch.value = search.value
    const query = { ...route.query }
    if (search.value) query.q = search.value
    else delete query.q
    if (query.q !== route.query.q) void router.replace({ query })
  }, 250)
}
watch(search, scheduleSearch)
watch(() => route.fullPath, () => {
  clearTimeout(timer)
  search.value = typeof route.query.q === 'string' ? route.query.q : ''
  appliedSearch.value = search.value
})
const visible = computed(() => filterItems(getItems(), {
  query: appliedSearch.value, category: category.value, autoOnly: autoOnly.value,
  savedOnly: savedOnly.value, saved: slugs.value,
}).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)))
function toggleSaved() {
  pushQuery({ ...route.query, q: search.value, saved: savedOnly.value ? '' : '1' } as Record<string, string>)
}

function pushQuery(next: Record<string, string | string[] | undefined>) {
  clearTimeout(timer)
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(next)) {
    if (typeof value === 'string' && value) query[key] = value
  }
  router.push({ query })
}

function setCategory(id: CategoryId | '') {
  pushQuery({
    q: search.value,
    category: id,
    saved: savedOnly.value ? '1' : '',
    source: autoOnly.value ? 'auto' : '',
  })
}

function showCollected() {
  pushQuery({
    q: search.value,
    source: autoOnly.value ? '' : 'auto',
    category: category.value,
    saved: savedOnly.value ? '1' : '',
  })
}

function showAll() {
  pushQuery({ q: search.value })
}

function focusSearch(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || target?.closest('input, textarea, select, [contenteditable="true"]')) return
  const field = document.querySelector<HTMLInputElement>('input[type="search"]')
  if (!field) return
  event.preventDefault()
  field.focus()
}

onMounted(() => window.addEventListener('keydown', focusSearch))
onUnmounted(() => { clearTimeout(timer); window.removeEventListener('keydown', focusSearch) })
</script>

<template>
  <div class="shell">
    <p class="kicker">
      <span>アーカイブ</span>
      <span role="status" aria-live="polite">{{ visible.length }}件</span>
    </p>
    <h1 class="display">{{ savedOnly ? '保存した記事' : autoOnly ? '収集した更新' : 'すべての要約' }}</h1>
    <p class="dek">タイトル、要約、タグから探せます。スラッシュキーで検索欄に戻ります。</p>

    <form class="search" role="search" @submit.prevent>
      <input
        v-model="search"
        @compositionstart="startComposition"
        @compositionend="endComposition"
        type="search"
        placeholder="Nuxt、Codex、Claude Code…"
        aria-label="記事を検索"
        @keydown.esc="search = ''"
      />
    </form>

    <div class="filters">
      <button type="button" class="chip" :aria-pressed="!category && !savedOnly && !autoOnly" @click="showAll">すべて</button>
      <button
        v-for="item in categories"
        :key="item.id"
        type="button"
        class="chip"
        :aria-pressed="category === item.id"
        @click="setCategory(item.id)"
      >
        {{ item.label }}
      </button>
      <button type="button" class="chip" :aria-pressed="autoOnly" @click="showCollected">収集</button>
      <button type="button" class="chip" :aria-pressed="savedOnly" @click="toggleSaved">保存のみ</button>
    </div>

    <div v-if="visible.length" class="grid">
      <ItemCard v-for="item in visible" :key="item.slug" :item="item" />
    </div>
    <p v-else class="empty">
      {{
        savedOnly
          ? '条件に一致する保存記事がありません。検索や分類を解除するか、記事を保存してください。'
          : '一致する記事がありません。言葉を短くすると見つかります。'
      }}
    </p>
  </div>
</template>
