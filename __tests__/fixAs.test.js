import fixAs from '../src/fixAs'
import { setInternals } from '../src/_helpers/_internals'

function cleanup() {
  setInternals({
    defaultLangRedirect: undefined,
    defaultLanguage: undefined,
    isStaticMode: undefined,
  })
}

describe('fixAs', () => {
  afterEach(cleanup)

  test('return the correct asPath', () => {
    setInternals({
      defaultLanguage: 'en',
    })
    expect(fixAs('/homepage', '/', 'en')).toBe('/homepage')
    expect(fixAs('/homepage/', '/', 'en')).toBe('/homepage/')
    expect(fixAs('/homepage', '/', 'it')).toBe('/it/homepage')
    expect(fixAs('/homepage/', '/', 'it')).toBe('/it/homepage/')
  })
})
