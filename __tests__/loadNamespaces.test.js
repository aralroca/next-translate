import React from 'react'
import loadNamespaces from '../src/loadNamespaces'

describe('loadNamespaces', () => {
  test('should load a namespace', async () => {
    const result = await loadNamespaces({
      logBuild: false,
      loader: false,
      locale: 'en',
      pages: { '*': ['common'] },
      pathname: './index.js',
      loadLocaleFrom: (__lang, ns) =>
        Promise.resolve({ test: 'This is a Test' }),
    })

    expect(result).toEqual({
      __lang: 'en',
      __namespaces: { common: { test: 'This is a Test' } },
    })
  })

  test('should load existing namespaces if one failed', async () => {
    const result = await loadNamespaces({
      logBuild: false,
      loader: false,
      locale: 'en',
      pages: { '*': ['common', 'demo'] },
      pathname: './index.js',
      loadLocaleFrom: (__lang, ns) => {
        if (ns === 'demo') {
          return Promise.reject()
        } else {
          return Promise.resolve({ test: 'This is a Test' })
        }
      },
    })

    expect(result).toEqual({
      __lang: 'en',
      __namespaces: { common: { test: 'This is a Test' }, demo: {} },
    })
  })
})
