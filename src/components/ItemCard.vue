<script setup lang="ts">
import { categoryOf, formatDate, type Item } from '../data/items'
import { useSaved } from '../composables/useSaved'

const props = defineProps<{ item: Item; featured?: 'lead' | 'side' }>()
const { has, toggle } = useSaved()

function onSave(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  toggle(props.item.slug)
}
</script>

<template>
  <article :class="featured ?? 'card'">
    <RouterLink :to="`/items/${item.slug}`" :class="featured ? '' : 'card-link'">
      <p class="meta">
        <span class="mark" :class="item.category">{{ categoryOf(item.category).label }}</span>
        <time :datetime="item.date">{{ formatDate(item.date) }}</time>
      </p>
      <h2>{{ item.title }}</h2>
      <p class="summary">{{ item.summary }}</p>
      <p class="why">{{ item.why }}</p>
    </RouterLink>
    <button
      class="save"
      type="button"
      :aria-pressed="has(item.slug)"
      @click="onSave"
    >
      {{ has(item.slug) ? '保存済み' : '保存' }}
    </button>
  </article>
</template>

<style scoped>
.card-link {
  display: flex;
  flex-direction: column;
  flex: 1;
  color: inherit;
  text-decoration: none;
  padding-right: 4.2rem;
}

.lead :deep(a),
.side :deep(a) {
  display: flex;
  flex-direction: column;
  flex: 1;
  color: inherit;
  text-decoration: none;
}
</style>
