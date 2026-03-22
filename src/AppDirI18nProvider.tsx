'use client'

import { I18nDictionary, LoaderConfig } from '.'

type AppDirI18nProviderProps = {
  lang: string
  namespaces: Record<string, I18nDictionary>
  config: LoaderConfig
  children: React.ReactNode
}

/**
 * @description AppDirI18nProvider for internal use (next-translate-plugin) only.
 * Is required because this is a RCC (React Client Component) and this way we
 * provide a global i18n context for client components.
 */
export default function AppDirI18nProvider({
  lang,
  namespaces = {},
  config,
  children,
}: AppDirI18nProviderProps) {
  // On the server, the RSC wrapper (templateAppDir) already sets
  // globalThis.__NEXT_TRANSLATE__ with the full config including
  // non-serializable properties like loadLocaleFrom.
  // The config prop here has been serialized via JSON.parse(JSON.stringify()),
  // which strips functions. Setting it on the server would overwrite the
  // correct config and break subsequent getT() calls (e.g. in generateMetadata)
  // that rely on loadLocaleFrom to dynamically load translations.
  if (typeof window !== 'undefined') {
    globalThis.__NEXT_TRANSLATE__ = { lang, namespaces, config }
  }

  // It return children and avoid re-renders and also allow children to be RSC (React Server Components)
  return children
}
