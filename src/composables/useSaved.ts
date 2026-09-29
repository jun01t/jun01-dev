import { computed, ref } from 'vue'

const STORAGE_KEY = 'jun01-desk-saved'
const slugs = ref<string[]>([])
let hydrated = false

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    slugs.value = Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : []
  } catch {
    slugs.value = []
  }
}

function write() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs.value))
}

export function useSaved() {
  if (!hydrated && typeof localStorage !== 'undefined') {
    read()
    hydrated = true
  }

  const count = computed(() => slugs.value.length)

  function has(slug: string) {
    return slugs.value.includes(slug)
  }

  function toggle(slug: string) {
    slugs.value = has(slug) ? slugs.value.filter((value) => value !== slug) : [...slugs.value, slug]
    write()
  }

  return { slugs, count, has, toggle }
}
