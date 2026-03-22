import React from 'react'
import { render } from '@testing-library/react'
import AppDirI18nProvider from '../src/AppDirI18nProvider'
import getT from '../src/getT'

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

    test('should NOT overwrite globalThis.__NEXT_TRANSLATE__ on the server', () => {
      const loadLocaleFrom = jest.fn()
      const serverConfig = {
        loadLocaleFrom,
        keySeparator: false,
      }

      // Simulate what the RSC wrapper (templateAppDir) does before rendering:
      // it sets globalThis.__NEXT_TRANSLATE__ with the full config including functions
      globalThis.__NEXT_TRANSLATE__ = {
        lang: 'en',
        namespaces: { common: { title: 'Hello' } },
        config: serverConfig,
      }

      // AppDirI18nProvider receives a serialized config (JSON.parse(JSON.stringify()))
      // which strips functions like loadLocaleFrom
      const serializedConfig = JSON.parse(JSON.stringify(serverConfig))

      // Call the component directly (as happens during SSR)
      AppDirI18nProvider({
        lang: 'en',
        namespaces: { common: { title: 'Hello' } },
        config: serializedConfig,
        children: React.createElement('div'),
      })

      // The config in globalThis should still have loadLocaleFrom
      expect(globalThis.__NEXT_TRANSLATE__.config.loadLocaleFrom).toBe(
        loadLocaleFrom
      )
    })

    test('getT should resolve translations after AppDirI18nProvider renders on server', async () => {
      const loadLocaleFrom = jest
        .fn()
        .mockImplementation((lang, ns) =>
          Promise.resolve({ 'meta.title': 'My Site Title' })
        )

      const serverConfig = {
        loadLocaleFrom,
        keySeparator: false,
      }

      // 1. RSC wrapper sets globalThis with full config (as templateAppDir does)
      globalThis.__NEXT_TRANSLATE__ = {
        lang: 'en',
        namespaces: { common: { 'meta.title': 'My Site Title' } },
        config: serverConfig,
      }

      // 2. AppDirI18nProvider runs on the server with serialized config (functions stripped)
      const serializedConfig = JSON.parse(JSON.stringify(serverConfig))
      AppDirI18nProvider({
        lang: 'en',
        namespaces: { common: { 'meta.title': 'My Site Title' } },
        config: serializedConfig,
        children: React.createElement('div'),
      })

      // 3. A subsequent getT call (e.g. from generateMetadata during soft navigation)
      //    should still resolve translations, not return the raw key
      const t = await getT('en', 'common')
      expect(t('meta.title')).toBe('My Site Title')
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
