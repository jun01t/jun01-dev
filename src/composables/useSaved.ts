import { computed, ref } from 'vue'
import { browserStorage } from './preferences-store.mjs'
import { getItems } from '../data/catalog'
import { createSavedStore, visibleSavedCount } from './saved-store.mjs'

const slugs = ref<string[]>([])
const storage = browserStorage()
const persisted = ref(true)

const store = createSavedStore(storage, (next: string[]) => {
  slugs.value = [...next]
})
slugs.value = [...store.snapshot()]

if (typeof window !== 'undefined') store.listen(window)

export function useSaved() {
  const count = computed(() => visibleSavedCount(slugs.value, getItems().map((item) => item.slug)))

  function has(slug: string) {
    return slugs.value.includes(slug)
  }

  function toggle(slug: string) {
    store.toggle(slug)
    persisted.value = store.isPersistent()
  }

  return { slugs, count, has, toggle, persisted }
}
