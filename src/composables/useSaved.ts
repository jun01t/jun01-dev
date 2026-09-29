import { computed, ref } from 'vue'
import { getItems } from '../data/catalog'
import { createSavedStore, visibleSavedCount } from './saved-store.mjs'

const slugs = ref<string[]>([])
const storage =
  typeof localStorage === 'undefined'
    ? {
        getItem: () => null,
        setItem: () => undefined,
      }
    : localStorage

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
  }

  return { slugs, count, has, toggle }
}
