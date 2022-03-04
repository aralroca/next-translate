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

const TestRussian = ({ i18nKey, query, namespaces }) => {
  return (
    <I18nProvider lang="ru" namespaces={namespaces}>
      <Inner i18nKey={i18nKey} query={query} />
    </I18nProvider>
  )
}

describe('withTranslation', () => {
  afterEach(cleanup)

  describe('getInitialProps', () => {
    test('should invoke getInitialProps of inner component', async () => {
      Translate.getInitialProps = jest.fn()
      const wrapperWithTranslation = withTranslation(Translate)
      await wrapperWithTranslation.getInitialProps()
      expect(Translate.getInitialProps).toBeCalled()
    })
  })

  describe('plurals', () => {
    test('should work with singular | count=1', () => {
      const i18nKey = 'ns:withsingular'
      const expected = 'The number is NOT ZERO'
      const withSingular = {
        withsingular: 'The number is NOT ZERO',
        withsingular_0: 'The number is ZERO!',
        withsingular_other: 'Oops!',
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

    test('should work with russian', () => {
      const i18nKey = 'ns:withrussian'
      const withRussian = {
        withrussian: 'The cart has only {{count}} product',
        withrussian_0: 'The cart is empty',
        withrussian_one: 'The cart number ends with one',
        withrussian_few: 'The card number is a number like 42',
        withrussian_many: 'The card number is a number like 100',
        withrussian_999: "The cart is full, you can't buy more products",
        withrussian_other: 'The cart has {{count}} products',
      }
      const r1 = render(
        <TestRussian
          namespaces={{ ns: withRussian }}
          i18nKey={i18nKey}
          query={{ count: 21 }}
        />
      )
      expect(r1.container.textContent).toContain(
        'The cart number ends with one'
      )

      const r2 = render(
        <TestRussian
          namespaces={{ ns: withRussian }}
          i18nKey={i18nKey}
          query={{ count: 42 }}
        />
      )
      expect(r2.container.textContent).toContain(
        'The card number is a number like 42'
      )

      const r3 = render(
        <TestRussian
          namespaces={{ ns: withRussian }}
          i18nKey={i18nKey}
          query={{ count: 100 }}
        />
      )
      expect(r3.container.textContent).toContain(
        'The card number is a number like 100'
      )

      const r4 = render(
        <TestRussian
          namespaces={{ ns: withRussian }}
          i18nKey={i18nKey}
          query={{ count: 999 }}
        />
      )
      expect(r4.container.textContent).toContain(
        "The cart is full, you can't buy more products"
      )

      const r5 = render(
        <TestRussian
          namespaces={{ ns: withRussian }}
          i18nKey={i18nKey}
          query={{ count: 1 }}
        />
      )
      expect(r5.container.textContent).toContain(
        'The cart number ends with one'
      )

      const r6 = render(
        <TestRussian
          namespaces={{ ns: withRussian }}
          i18nKey={i18nKey}
          query={{ count: 0 }}
        />
      )
      expect(r6.container.textContent).toContain('The cart is empty')

      const r7 = render(
        <TestRussian
          namespaces={{ ns: withRussian }}
          i18nKey={i18nKey}
          query={{ count: Infinity }}
        />
      )
      expect(r7.container.textContent).toContain(
        'The cart has Infinity products'
      )
    })

    test('should work with singular | count=0', () => {
      const i18nKey = 'ns:withsingular'
      const expected = 'The number is NOT ONE'
      const withSingular = {
        withsingular: 'The number is NOT ONE',
        withsingular_1: 'The number is ONE!',
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
        withsingular_other: 'Oops!',
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
        withsingular_other: 'Oops!',
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
        withplural_other: 'Number is bigger than one!',
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
        withplural_other: 'Number is bigger than one!',
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

  test('should work with default namespace', () => {
    const i18nKey = 'simple'
    const namespace = {
      simple: 'This is working',
    }

    const Inner = withTranslation(Translate, 'ns')

    const { container } = render(
      <I18nProvider lang="en" namespaces={{ ns: namespace }}>
        <Inner i18nKey={i18nKey} />
      </I18nProvider>
    )
    expect(container.textContent).toContain(namespace.simple)
  })
})
