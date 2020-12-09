export default function getConfig() {
  // We are not using globalThis to support Node 10
  const g = typeof window === 'undefined' ? global : window
  // @ts-ignore
  return g.i18nConfig
}
