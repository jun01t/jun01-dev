export const SAVED_KEY = 'jun01-desk-saved'

export function toggleSlug(slugs, slug) {
  return slugs.includes(slug) ? slugs.filter((value) => value !== slug) : [...slugs, slug]
}

/**
 * @param {string[]} slugs
 * @param {string[]} existingSlugs
 */
export function visibleSavedCount(slugs, existingSlugs) {
  const existing = new Set(existingSlugs)
  return slugs.filter((slug) => existing.has(slug)).length
}

function readSlugs(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(SAVED_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : []
  } catch {
    return []
  }
}

/**
 * @param {Pick<Storage, 'getItem' | 'setItem'>} storage
 * @param {(slugs: string[]) => void} [onChange]
 */
export function createSavedStore(storage, onChange = () => {}) {
  let slugs = readSlugs(storage)

  function publish() {
    onChange(slugs)
  }

  function toggle(slug) {
    slugs = toggleSlug(readSlugs(storage), slug)
    storage.setItem(SAVED_KEY, JSON.stringify(slugs))
    publish()
    return slugs
  }

  function listen(target) {
    target.addEventListener('storage', (event) => {
      if (event.key !== SAVED_KEY) return
      slugs = readSlugs(storage)
      publish()
    })
  }

  return {
    toggle,
    listen,
    snapshot: () => slugs,
  }
}
