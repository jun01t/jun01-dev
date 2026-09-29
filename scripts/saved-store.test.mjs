import assert from 'node:assert/strict'
import test from 'node:test'
import { createSavedStore, SAVED_KEY, visibleSavedCount } from '../src/composables/saved-store.mjs'

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  }
}

test('a second tab reads the latest saves before writing', () => {
  const storage = memoryStorage()
  const first = createSavedStore(storage)
  const second = createSavedStore(storage)
  first.toggle('one')
  second.toggle('two')
  assert.deepEqual(second.snapshot(), ['one', 'two'])
  assert.deepEqual(JSON.parse(storage.getItem(SAVED_KEY)), ['one', 'two'])
})

test('a storage event refreshes the other tab', () => {
  const storage = memoryStorage()
  const listeners = []
  const store = createSavedStore(storage)
  store.listen({
    addEventListener: (_type, listener) => listeners.push(listener),
  })
  storage.setItem(SAVED_KEY, JSON.stringify(['remote']))
  listeners[0]({ key: SAVED_KEY })
  assert.deepEqual(store.snapshot(), ['remote'])
})

test('the header count ignores slugs that are no longer published', () => {
  assert.equal(visibleSavedCount(['live', 'gone'], ['live']), 1)
})
