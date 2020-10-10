import fixHref from '../src/fixHref'
import { setInternals } from '../src/_helpers/_internals'

function cleanup() {
  setInternals({
    defaultLangRedirect: undefined,
    defaultLanguage: undefined,
    isStaticMode: undefined,
  })
}

describe('fixHref', () => {
  afterEach(cleanup)

  test('add lang query parameter to pathname', () => {
    setInternals({
      defaultLanguage: 'en',
    })
    expect(fixHref('/homepage', 'en')).toBe('/homepage?lang=en')
    expect(fixHref('/homepage/', 'en')).toBe('/homepage/?lang=en')
    expect(fixHref('/homepage?foo=baz', 'en')).toBe('/homepage?foo=baz&lang=en')
    expect(fixHref('/homepage/?foo=baz', 'en')).toBe(
      '/homepage/?foo=baz&lang=en'
    )
    expect(fixHref('/homepage', 'it')).toBe('/homepage?lang=it')
    expect(fixHref('/homepage/', 'it')).toBe('/homepage/?lang=it')
    expect(fixHref('/homepage?foo=baz', 'it')).toBe('/homepage?foo=baz&lang=it')
    expect(fixHref('/homepage/?foo=baz', 'it')).toBe(
      '/homepage/?foo=baz&lang=it'
    )
  })
  test('arrange query string before hash', () => {
    setInternals({
      defaultLanguage: 'en',
    })
    expect(fixHref('/#anchor', 'en')).toBe('/?lang=en#anchor')
    expect(fixHref('/homepage#anchor', 'en')).toBe('/homepage?lang=en#anchor')
    expect(fixHref('/homepage/#anchor', 'en')).toBe('/homepage/?lang=en#anchor')
    expect(fixHref('/homepage?foo=baz#anchor', 'en')).toBe(
      '/homepage?foo=baz&lang=en#anchor'
    )
    expect(fixHref('/homepage/?foo=baz#anchor', 'en')).toBe(
      '/homepage/?foo=baz&lang=en#anchor'
    )
    expect(fixHref('/#anchor', 'it')).toBe('/?lang=it#anchor')
    expect(fixHref('/homepage#anchor', 'it')).toBe('/homepage?lang=it#anchor')
    expect(fixHref('/homepage/#anchor', 'it')).toBe('/homepage/?lang=it#anchor')
    expect(fixHref('/homepage?foo=baz#anchor', 'it')).toBe(
      '/homepage?foo=baz&lang=it#anchor'
    )
    expect(fixHref('/homepage/?foo=baz#anchor', 'it')).toBe(
      '/homepage/?foo=baz&lang=it#anchor'
    )
  })
})
