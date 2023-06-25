import getT from '../src/getT'

const mockLoadLocaleFrom = jest.fn()

global.i18nConfig = {
  keySeparator: false,
  loadLocaleFrom: (...args) => mockLoadLocaleFrom(...args),
}

describe('getT', () => {
  beforeEach(() => {
    globalThis.__NEXT_TRANSLATE__ = {}
    mockLoadLocaleFrom.mockImplementation((__lang, ns) => {
      if (ns === 'ns1') {
        return Promise.resolve({
          key_ns1: 'message from ns1',
        })
      }
      if (ns === 'ns2') {
        return Promise.resolve({
          key_ns2: 'message from ns2',
        })
      }
    })
  })
  test('should load one namespace and translate + warning', async () => {
    console.warn = jest.fn()
    const t = await getT('en', 'ns1')
    const expectedWarning =
      '[next-translate] "ns2:key_ns2" is missing in current namespace configuration. Try adding "key_ns2" to the namespace "ns2".'

    expect(typeof t).toBe('function')
    expect(t('ns1:key_ns1')).toEqual('message from ns1')
    expect(t('ns2:key_ns2')).toEqual('ns2:key_ns2')
    expect(console.warn).toBeCalledWith(expectedWarning)
  })

  test('should work with flat keys', async () => {
    mockLoadLocaleFrom.mockImplementationOnce(async (__lang, ns) => ({
      'this.is.a.flat.key': 'works',
    }))
    const t = await getT('en', 'common')
    expect(t('this.is.a.flat.key')).toEqual('works')
  })

  test('should work inside appDir', async () => {
    const mockAppDirLoadLocaleFrom = jest.fn()
    globalThis.__NEXT_TRANSLATE__ = {
      config: {
        keySeparator: false,
        loadLocaleFrom: (...args) => mockAppDirLoadLocaleFrom(...args),
      },
    }
    mockAppDirLoadLocaleFrom.mockImplementationOnce(async (__lang, ns) => ({
      'example-app-dir': 'works',
    }))
    const t = await getT('en', 'common')
    expect(t('example-app-dir')).toEqual('works')
  })

  test('should load multiple namespaces and translate', async () => {
    const t = await getT('en', ['ns1', 'ns2'])
    expect(typeof t).toBe('function')

    expect(t('ns1:key_ns1')).toEqual('message from ns1')
    expect(t('ns2:key_ns2')).toEqual('message from ns2')
  })

  test('should use the only namespace as default', async () => {
    const t = await getT('en', 'ns1')
    expect(typeof t).toBe('function')

    expect(t('key_ns1')).toEqual('message from ns1')
  })

  test('should use the first namespace as default', async () => {
    console.warn = jest.fn()
    const t = await getT('en', ['ns2', 'ns1'])
    const expectedWarning =
      '[next-translate] "ns2:key_ns1" is missing in current namespace configuration. Try adding "key_ns1" to the namespace "ns2".'

    expect(typeof t).toBe('function')
    expect(t('key_ns2')).toEqual('message from ns2')
    expect(t('key_ns1')).toEqual('key_ns1')
    expect(t('ns1:key_ns1')).toEqual('message from ns1')
    expect(console.warn).toBeCalledWith(expectedWarning)
  })
})
