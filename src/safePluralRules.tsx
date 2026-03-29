/**
 * Creates an Intl.PluralRules instance safely.
 * If the locale is invalid (e.g. a random path segment like "favicon.ico"),
 * it falls back to the default PluralRules instead of throwing,
 * preventing 500 errors on pages that should return 400/404.
 */
export default function safePluralRules(locale?: string): Intl.PluralRules {
  try {
    return new Intl.PluralRules(locale)
  } catch (_e) {
    return new Intl.PluralRules()
  }
}
