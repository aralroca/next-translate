import React from 'react'
import { render } from '@testing-library/react'
import AppDirI18nProvider from '../src/AppDirI18nProvider'

describe('AppDirI18nProvider', () => {
  const originalWindow = global.window

  afterEach(() => {
    global.window = originalWindow
    delete globalThis.__NEXT_TRANSLATE__
    delete global.i18nConfig
  })

  describe('on the server (window is undefined)', () => {
    beforeEach(() => {
      delete global.window
    })

    afterEach(() => {
      global.window = originalWindow
    })

    test('should set globalThis.__NEXT_TRANSLATE__ on the server', () => {
      const config = { keySeparator: false }
      const namespaces = { common: { title: 'Hello' } }

      AppDirI18nProvider({
        lang: 'en',
        namespaces,
        config,
        children: React.createElement('div'),
      })

      expect(globalThis.__NEXT_TRANSLATE__).toEqual({
        lang: 'en',
        namespaces,
        config,
      })
    })
  })

  describe('on the client (window is defined)', () => {
    test('should set globalThis.__NEXT_TRANSLATE__ on the client', () => {
      const config = { keySeparator: '.' }
      const namespaces = { common: { title: 'Hello' } }

      render(
        React.createElement(AppDirI18nProvider, {
          lang: 'en',
          namespaces,
          config,
          children: React.createElement('div'),
        })
      )

      expect(globalThis.__NEXT_TRANSLATE__).toEqual({
        lang: 'en',
        namespaces,
        config,
      })
    })
  })
})
