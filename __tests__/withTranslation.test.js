import React from 'react'
import { render, cleanup } from '@testing-library/react'
import I18nProvider from '../src/I18nProvider'
import withTranslation from '../src/withTranslation'

class Translate extends React.Component {
  render() {
    const { i18nKey, query } = this.props
    const { t } = this.props.i18n

    return t(i18nKey, query)
  }
}

const Inner = withTranslation(Translate)

const TestEnglish = ({ i18nKey, query, namespaces }) => {
  return (
    <I18nProvider lang="en" namespaces={namespaces}>
      <Inner i18nKey={i18nKey} query={query} />
    </I18nProvider>
  )
}

describe('withTranslation', () => {
  afterEach(cleanup)

  describe('plurals', () => {
    test('should work with singular | count=1', () => {
      const i18nKey = 'ns:withsingular'
      const expected = 'The number is NOT ZERO'
      const withSingular = {
        withsingular: 'The number is NOT ZERO',
        withsingular_0: 'The number is ZERO!',
        withsingular_plural: 'Oops!',
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          query={{ count: 1 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with singular | count=0', () => {
      const i18nKey = 'ns:withsingular'
      const expected = 'The number is NOT ONE'
      const withSingular = {
        withsingular: 'The number is NOT ONE',
        withsingular_1: 'The number is ONE!',
        withsingular_plural: 'Oops!',
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          query={{ count: 0 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with _1 | count=1', () => {
      const i18nKey = 'ns:withsingular'
      const expected = 'The number is ONE!'
      const with_1 = {
        withsingular: 'The number is NOT ONE',
        withsingular_1: 'The number is ONE!',
        withsingular_plural: 'Oops!',
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: with_1 }}
          i18nKey={i18nKey}
          query={{ count: 1 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with _0 | count=0', () => {
      const i18nKey = 'ns:withsingular'
      const expected = 'The number is ZERO!'
      const with_0 = {
        withsingular: 'The number is NOT ZERO',
        withsingular_0: 'The number is ZERO!',
        withsingular_plural: 'Oops!',
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: with_0 }}
          i18nKey={i18nKey}
          query={{ count: 0 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with plural | count=2', () => {
      const i18nKey = 'ns:withplural'
      const expected = 'Number is bigger than one!'
      const withPlural = {
        withplural: 'Singular',
        withplural_1: 'The number is ONE!',
        withplural_plural: 'Number is bigger than one!',
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withPlural }}
          i18nKey={i18nKey}
          query={{ count: 2 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with _2 | count=2', () => {
      const i18nKey = 'ns:withplural'
      const expected = 'The number is TWO!'
      const withPlural = {
        withplural: 'Singular',
        withplural_2: 'The number is TWO!',
        withplural_plural: 'Number is bigger than one!',
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withPlural }}
          i18nKey={i18nKey}
          query={{ count: 2 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })
  })
})
