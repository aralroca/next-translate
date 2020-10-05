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
})
