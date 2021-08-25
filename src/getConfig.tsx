import { LoaderConfig } from './index'

export default function getConfig(): LoaderConfig {
  // We are not using globalThis to support Node 10
  const g: any = typeof window === 'undefined' ? global : window
  return g.i18nConfig
}
