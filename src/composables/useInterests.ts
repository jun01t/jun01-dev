import { ref } from 'vue'
import { browserStorage, normalizeInterests, PREFERENCES_KEY, readInterests, writeInterests } from './preferences-store.mjs'
const storage = browserStorage()
const interests = ref<string[]>(readInterests(storage))
const persisted = ref(true)
function set(next: string[]) {
  interests.value = normalizeInterests(next)
  persisted.value = writeInterests(storage, interests.value)
}
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key === PREFERENCES_KEY || event.key === null) interests.value = readInterests(storage)
})
export function useInterests() {
  return { interests, persisted, reset: () => set([]), toggle: (id: string) => set(interests.value.includes(id) ? interests.value.filter(value => value !== id) : [...interests.value, id]) }
}
