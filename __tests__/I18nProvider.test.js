import React, { useState } from 'react'
import { render, cleanup, fireEvent, act } from '@testing-library/react'
import I18nProvider from '../src/I18nProvider.tsx'
import useTranslation from '../src/useTranslation.tsx'

describe('I18nProvider', () => {
  afterEach(cleanup)

  test('should update translation function when lang changes', async () => {
    const App = () => {
      const [lang, setLang] = useState('en')
      const namespaces =
        lang === 'en'
          ? { common: { hello: 'Hello' } }
          : { common: { hello: 'Hola' } }

      return (
        <I18nProvider lang={lang} namespaces={namespaces}>
          <Content />
          <button onClick={() => setLang('es')}>Change to ES</button>
        </I18nProvider>
      )
    }

    const Content = () => {
      const { t, lang } = useTranslation('common')
      return (
        <div>
          <span data-testid="lang">{lang}</span>
          <span data-testid="text">{t('hello')}</span>
        </div>
      )
    }

    const { getByTestId, getByText } = render(<App />)

    expect(getByTestId('lang').textContent).toBe('en')
    expect(getByTestId('text').textContent).toBe('Hello')

    await act(async () => {
      fireEvent.click(getByText('Change to ES'))
    })

    expect(getByTestId('lang').textContent).toBe('es')
    expect(getByTestId('text').textContent).toBe('Hola')
  })
})
