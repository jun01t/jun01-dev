import { TOPICS } from '../lib/discovery.mjs'
export const PREFERENCES_KEY = 'jun01-desk-interests-v1'
export function normalizeInterests(value) {
  return Array.isArray(value) ? [...new Set(value.filter(id => TOPICS.some(topic => topic.id === id)))] : []
}
export function readInterests(storage) {
  try { return normalizeInterests(JSON.parse(storage.getItem(PREFERENCES_KEY) ?? '[]')) } catch { return [] }
}
export function writeInterests(storage, value) {
  try { storage.setItem(PREFERENCES_KEY, JSON.stringify(normalizeInterests(value))); return true } catch { return false }
}
export function browserStorage() {
  try { return window.localStorage } catch { return undefined }
}
