import startsWithLang from '../src/_helpers/startsWithLang'

describe('startsWithLang', () => {
  test('returns true if url starts with lang', () => {
    expect(startsWithLang('/en', ['en', 'es'])).toBe(true)
    expect(startsWithLang('/es', ['en', 'es'])).toBe(true)
    expect(startsWithLang('/en/page', ['en', 'es'])).toBe(true)
    expect(startsWithLang('/es/page', ['en', 'es'])).toBe(true)
    expect(startsWithLang('/en#anchor', ['en', 'es'])).toBe(true)
    expect(startsWithLang('/es#anchor', ['en', 'es'])).toBe(true)
  })

  test('returns false if url does not start with lang', () => {
    expect(startsWithLang('/', ['en', 'es'])).toBe(false)
    expect(startsWithLang('/', ['en', 'es'])).toBe(false)
    expect(startsWithLang('/page', ['en', 'es'])).toBe(false)
    expect(startsWithLang('/page', ['en', 'es'])).toBe(false)
    expect(startsWithLang('/#anchor', ['en', 'es'])).toBe(false)
    expect(startsWithLang('/#anchor', ['en', 'es'])).toBe(false)
  })
})
