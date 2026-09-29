<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ItemCard from '../components/ItemCard.vue'
import { categories, items, type CategoryId } from '../data/items'
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

watch(search, (value) => {
  const query = { ...route.query }
  if (value) query.q = value
  else delete query.q
  router.replace({ query })
})

watch(
  () => route.query.q,
  (value) => {
    search.value = typeof value === 'string' ? value : ''
  },
)

const visible = computed(() => {
  const needle = search.value.trim().toLowerCase()
  return items
    .filter((item) => (category.value ? item.category === category.value : true))
    .filter((item) => (savedOnly.value ? slugs.value.includes(item.slug) : true))
    .filter((item) => {
      if (!needle) return true
      const haystack = [item.title, item.summary, item.why, item.tags.join(' ')].join(' ').toLowerCase()
      return haystack.includes(needle)
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
})

function pushQuery(next: Record<string, string | string[] | undefined>) {
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
  })
}

function showAll() {
  pushQuery({ q: search.value })
}

function focusSearch(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (event.key !== '/' || target?.closest('input, textarea')) return
  const field = document.querySelector<HTMLInputElement>('input[type="search"]')
  if (!field) return
  event.preventDefault()
  field.focus()
}

onMounted(() => window.addEventListener('keydown', focusSearch))
onUnmounted(() => window.removeEventListener('keydown', focusSearch))
</script>

<template>
  <div class="shell">
    <p class="kicker">
      <span>アーカイブ</span>
      <span>{{ visible.length }}件</span>
    </p>
    <h1 class="display">{{ savedOnly ? '保存した記事' : 'すべての要約' }}</h1>
    <p class="dek">タイトル、要約、タグから探せます。スラッシュキーで検索欄に戻ります。</p>

    <form class="search" role="search" @submit.prevent>
      <input
        v-model="search"
        type="search"
        placeholder="Nuxt、KVM、Cursor…"
        aria-label="記事を検索"
        @keydown.esc="search = ''"
      />
    </form>

    <div class="filters">
      <button type="button" class="chip" :aria-pressed="!category && !savedOnly" @click="showAll">すべて</button>
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
      <RouterLink v-slot="{ href, navigate }" to="/archive?saved=1" custom>
        <a
          :href="href"
          class="chip"
          :class="{ active: savedOnly }"
          :aria-current="savedOnly ? 'page' : undefined"
          @click="navigate"
        >保存のみ</a>
      </RouterLink>
    </div>

    <div v-if="visible.length" class="grid">
      <ItemCard v-for="item in visible" :key="item.slug" :item="item" />
    </div>
    <p v-else class="empty">
      {{
        savedOnly
          ? 'まだ保存がありません。各記事の「保存」は、このブラウザに残ります。'
          : '一致する記事がありません。言葉を短くすると見つかります。'
      }}
    </p>
  </div>
</template>
