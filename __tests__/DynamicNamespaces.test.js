import React, { useState } from 'react'
import { render, cleanup, fireEvent, act } from '@testing-library/react'
import I18nProvider from '../src/I18nProvider.tsx'
import useTranslation from '../src/useTranslation.tsx'
import DynamicNamespaces from '../src/DynamicNamespaces.tsx'

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
})
