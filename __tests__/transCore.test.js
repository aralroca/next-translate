import transCore from '../src/transCore'

const nsNestedKeys = {
  key_1: {
    key_1_nested: 'message 1 nested',
    key_2_nested: 'message 2 nested',
  },
  key_2: 'message 2',
}

const nsRootKeys = {
  root_key_1: 'root message 1',
  root_key_2: 'root message 2',
}

const nsInterpolate = {
  key_1: {
    key_1_nested: 'message 1 {{count}}',
    key_2_nested: 'message 2 {{count}}',
  },
  key_2: 'message 2',
}

const nsWithEmpty = {
  emptyKey: '',
}

describe('transCore', () => {
  test('should return an object of root keys', async () => {
    const t = transCore({
      config: {},
      allNamespaces: { nsRootKeys },
      lang: 'en',
    })

    expect(typeof t).toBe('function')
    expect(t('nsRootKeys:.', null, { returnObjects: true })).toEqual(nsRootKeys)
  })

  test('should return an object of root keys for the defaultNs', async () => {
    const t = transCore({
      config: {
        defaultNS: 'nsRootKeys',
      },
      allNamespaces: { nsRootKeys },
      lang: 'en',
    })

    expect(typeof t).toBe('function')
    expect(t('.', null, { returnObjects: true })).toEqual(nsRootKeys)
  })

  test('should return an object of root keys when using the keySeparator', async () => {
    const keySeparator = '___'
    const t = transCore({
      config: {
        keySeparator,
      },
      allNamespaces: { nsRootKeys },
      lang: 'en',
    })

    expect(typeof t).toBe('function')
    expect(
      t(`nsRootKeys:${keySeparator}`, null, { returnObjects: true })
    ).toEqual(nsRootKeys)
  })

  test('should allow flat keys when keySeparator=false', async () => {
    const t = transCore({
      config: {
        keySeparator: false,
      },
      allNamespaces: { common: { 'example.flat.key': 'works' } },
      lang: 'en',
    })

    expect(t('common:example.flat.key')).toEqual('works')
  })

  test('should return an object of nested keys', async () => {
    const t = transCore({
      config: {},
      allNamespaces: { nsObject: nsNestedKeys },
      lang: 'en',
    })

    expect(typeof t).toBe('function')
    expect(t('nsObject:key_1', null, { returnObjects: true })).toEqual(
      nsNestedKeys.key_1
    )
    expect(t('nsObject:key_2', null, { returnObjects: true })).toEqual(
      nsNestedKeys.key_2
    )
  })

  test('should return an object of nested keys and interpolate correctly', async () => {
    const t = transCore({
      config: {},
      allNamespaces: { nsInterpolate },
      pluralRules: { select() {}, resolvedOptions() {} },
      lang: 'en',
    })

    const count = 999
    const expected = {
      key_1: {
        key_1_nested: `message 1 ${count}`,
        key_2_nested: `message 2 ${count}`,
      },
      key_2: 'message 2',
    }

    expect(typeof t).toBe('function')
    expect(t('nsInterpolate:.', { count }, { returnObjects: true })).toEqual(
      expected
    )
  })

  test('should return empty string when allowEmptyStrings is passed as true.', () => {
    const t = transCore({
      config: {
        allowEmptyStrings: true,
      },
      allNamespaces: { nsWithEmpty },
      lang: 'en',
    })

    expect(typeof t).toBe('function')
    expect(t('nsWithEmpty:emptyKey')).toEqual('')
  })

  test('should return empty string when allowEmptyStrings is omitted.', () => {
    const t = transCore({
      allNamespaces: { nsWithEmpty },
      config: {},
      lang: 'en',
    })

    expect(typeof t).toBe('function')
    expect(t('nsWithEmpty:emptyKey')).toEqual('')
  })

  test('should return the key name when allowEmptyStrings is omit passed as false.', () => {
    const t = transCore({
      config: {
        allowEmptyStrings: false,
      },
      allNamespaces: { nsWithEmpty },
      lang: 'en',
    })

    expect(typeof t).toBe('function')
    expect(t('nsWithEmpty:emptyKey')).toEqual('nsWithEmpty:emptyKey')
  })
})
