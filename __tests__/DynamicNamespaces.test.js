import React, { useState } from 'react'
import { render, cleanup, fireEvent, act } from '@testing-library/react'
import I18nProvider from '../src/I18nProvider'
import useTranslation from '../src/useTranslation'
import DynamicNamespaces from '../src/DynamicNamespaces'

describe('DynamicNamespaces', () => {
  afterEach(cleanup)

  test('should reload namespaces when lang changes', async () => {
    const loadLocale = jest.fn((lang, ns) => {
      const locales = {
        en: { common: { hello: 'Hello' } },
        es: { common: { hello: 'Hola' } },
      }
      return Promise.resolve(locales[lang][ns])
    })

    const App = () => {
      const [lang, setLang] = useState('en')
      return (
        <I18nProvider lang={lang} config={{ loadLocaleFrom: loadLocale }}>
          <DynamicNamespaces namespaces={['common']}>
            <Content />
          </DynamicNamespaces>
          <button onClick={() => setLang('es')}>Change to ES</button>
        </I18nProvider>
      )
    }

    const Content = () => {
      const { t } = useTranslation('common')
      return <span data-testid="text">{t('hello')}</span>
    }

    const { getByTestId, getByText } = render(<App />)

    await act(async () => {
      await Promise.resolve()
    })

    expect(getByTestId('text').textContent).toBe('Hello')
    expect(loadLocale).toHaveBeenCalledWith('en', 'common')

    await act(async () => {
      fireEvent.click(getByText('Change to ES'))
    })

    expect(loadLocale).toHaveBeenCalledWith('es', 'common')

    await act(async () => {
      await Promise.resolve()
    })

    expect(getByTestId('text').textContent).toBe('Hola')
  })

  test('should not suffer from race conditions when lang changes rapidly', async () => {
    let resolveES
    const esPromise = new Promise((resolve) => {
      resolveES = () => resolve({ hello: 'Hola' })
    })

    const loadLocale = jest.fn((lang, ns) => {
      if (lang === 'en') return Promise.resolve({ hello: 'Hello' })
      if (lang === 'es') return esPromise
      return Promise.resolve({})
    })

    const App = () => {
      const [lang, setLang] = useState('en')
      return (
        <I18nProvider lang={lang} config={{ loadLocaleFrom: loadLocale }}>
          <DynamicNamespaces namespaces={['common']}>
            <Content />
          </DynamicNamespaces>
          <button onClick={() => setLang('es')}>Change to ES</button>
          <button onClick={() => setLang('en')}>Change back to EN</button>
        </I18nProvider>
      )
    }

    const Content = () => {
      const { t } = useTranslation('common')
      return <span data-testid="text">{t('hello')}</span>
    }

    const { getByTestId, getByText } = render(<App />)

    // Initial load EN
    await act(async () => {
      await Promise.resolve()
    })
    expect(getByTestId('text').textContent).toBe('Hello')

    // Change to ES (will be pending)
    await act(async () => {
      fireEvent.click(getByText('Change to ES'))
    })

    // Change back to EN immediately
    await act(async () => {
      fireEvent.click(getByText('Change back to EN'))
    })

    // Wait for EN to resolve (it resolves instantly in our mock)
    await act(async () => {
      await Promise.resolve()
    })

    // Now resolve the stale ES request
    await act(async () => {
      resolveES()
      await esPromise
    })

    // It should still be 'Hello' because the ES request was stale
    expect(getByTestId('text').textContent).toBe('Hello')
  })
})
