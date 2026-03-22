import { I18nDictionary } from '.'

type NamespaceStore = Record<string, I18nDictionary>

// React.cache creates a per-request memoized function (React 19+).
// Each static page render during `next build` gets its own cached store,
// preventing cross-locale namespace pollution via globalThis.
let createRequestStore: () => NamespaceStore

try {
  const React = require('react')
  if (typeof React.cache === 'function') {
    createRequestStore = React.cache((): NamespaceStore => ({}))
  }
} catch {}

// @ts-ignore - fallback for React 18 or non-RSC contexts
if (!createRequestStore) {
  // Without React.cache, fall back to copying from globalThis (current behavior)
  createRequestStore = () => ({
    ...(globalThis.__NEXT_TRANSLATE__?.namespaces ?? {}),
  })
}

export function getRequestNamespaces(): NamespaceStore {
  return createRequestStore()
}
