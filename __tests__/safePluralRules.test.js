import safePluralRules from '../src/safePluralRules'

describe('safePluralRules', () => {
  test('should return PluralRules for a valid locale', () => {
    const rules = safePluralRules('en')
    expect(rules).toBeInstanceOf(Intl.PluralRules)
    expect(rules.select(1)).toBe('one')
    expect(rules.select(2)).toBe('other')
  })

  test('should return PluralRules for undefined locale (default)', () => {
    const rules = safePluralRules(undefined)
    expect(rules).toBeInstanceOf(Intl.PluralRules)
  })

  test('should return default PluralRules for an invalid locale', () => {
    const rules = safePluralRules('favicon.ico')
    expect(rules).toBeInstanceOf(Intl.PluralRules)
    expect(rules.select(1)).toBe('one')
    expect(rules.select(2)).toBe('other')
  })

  test('should return default PluralRules for a random path segment', () => {
    const rules = safePluralRules('not-a-locale-at-all')
    expect(rules).toBeInstanceOf(Intl.PluralRules)
  })

  test('should return default PluralRules for an empty string', () => {
    const rules = safePluralRules('')
    expect(rules).toBeInstanceOf(Intl.PluralRules)
  })

  test('should work correctly with different valid locales', () => {
    const ar = safePluralRules('ar')
    expect(ar).toBeInstanceOf(Intl.PluralRules)
    // Arabic has 'zero' plural category
    expect(ar.select(0)).toBe('zero')

    const ja = safePluralRules('ja')
    expect(ja).toBeInstanceOf(Intl.PluralRules)
    // Japanese uses 'other' for everything
    expect(ja.select(1)).toBe('other')
  })
})
