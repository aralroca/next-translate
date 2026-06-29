import React, { useState } from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import createTranslation from '../src/createTranslation'

describe('createTranslation', () => {
  afterEach(cleanup)
  beforeAll(() => {
    console.warn = jest.fn()
  })

  test('refreshes t when the namespace set changes (client-side navigation)', () => {
    // First SSR page only loaded "ns1".
    globalThis.__NEXT_TRANSLATE__ = {
      lang: 'en',
      namespaces: { ns1: { key: 'from ns1' } },
      config: {},
    }

    // A long-lived holder that never unmounts (mimics a translation function
    // lifted to _app / a context provider in the Pages Router).
    const Holder = () => {
      const [, rerender] = useState(0)
      const { t } = createTranslation()
      return (
        <>
          <button
            type="button"
            onClick={() => {
              // Client-side navigation loads a new page whose namespace set is "ns2".
              globalThis.__NEXT_TRANSLATE__ = {
                lang: 'en',
                namespaces: { ns2: { key: 'from ns2' } },
                config: {},
              }
              rerender((x) => x + 1)
            }}
          >
            navigate
          </button>
          <span data-testid="out">{t('ns2:key')}</span>
        </>
      )
    }

    const { getByText, getByTestId } = render(<Holder />)

    // "ns2" is not loaded yet, so the key is returned untranslated.
    expect(getByTestId('out').textContent).toBe('ns2:key')

    fireEvent.click(getByText('navigate'))

    // After navigation "ns2" is loaded; the memoized t must pick up the new
    // namespace set even though defaultNS and lang are unchanged.
    expect(getByTestId('out').textContent).toBe('from ns2')
  })

  test('keeps a stable t reference across re-renders when the namespace set is unchanged', () => {
    globalThis.__NEXT_TRANSLATE__ = {
      lang: 'en',
      namespaces: { ns1: { key: 'from ns1' } },
      config: {},
    }

    const seen = []

    const Holder = () => {
      const [, rerender] = useState(0)
      const { t } = createTranslation()
      seen.push(t)
      return (
        <button type="button" onClick={() => rerender((x) => x + 1)}>
          rerender
        </button>
      )
    }

    const { getByText } = render(<Holder />)
    fireEvent.click(getByText('rerender'))

    // Identity must stay stable when nothing relevant changed (see #447).
    expect(seen.length).toBeGreaterThanOrEqual(2)
    expect(seen[seen.length - 1]).toBe(seen[0])
  })
})
