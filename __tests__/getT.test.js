import getT from '../src/getT'

describe('getT', () => {
  beforeAll(() => {
    global.i18nConfig = {
      loadLocaleFrom: (__lang, ns) => {
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
      },
    }
  })

  test('should load one namespace and translate', async () => {
    const t = await getT('en', 'ns1')
    expect(typeof t).toBe('function')

    expect(t('ns1:key_ns1')).toEqual('message from ns1')
    expect(t('ns2:key_ns2')).toEqual('ns2:key_ns2')
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
    const t = await getT('en', ['ns2', 'ns1'])
    expect(typeof t).toBe('function')

    expect(t('key_ns2')).toEqual('message from ns2')
    expect(t('key_ns1')).toEqual('key_ns1')
    expect(t('ns1:key_ns1')).toEqual('message from ns1')
  })
})
