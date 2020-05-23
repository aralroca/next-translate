import React from 'react'
import { render, cleanup } from '@testing-library/react'
import I18nProvider from '../src/I18nProvider'
import useTranslation from '../src/useTranslation'

const Inner = ({ i18nKey, query }) => {
  const { t } = useTranslation()
  return t(i18nKey, query)
}

const TestEnglish = ({ i18nKey, query, namespaces }) => {
  return (
    <I18nProvider lang="en" namespaces={namespaces}>
      <Inner i18nKey={i18nKey} query={query} />
    </I18nProvider>
  )
}

describe('useTranslation', () => {
  afterEach(cleanup)

  describe('fallbacks', () => {
    test('should return an empty string if t(undefined)', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const test = t(undefined)
        return (
          <>
            {test} | {typeof test}
          </>
        )
      }

      const expected = ' | string'

      const { container } = render(
        <I18nProvider lang="en" namespaces={{}}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })

    test('should return the key as fallback using wrong the nested translations', () => {
      const i18nKey = 'ns:grandfather.parent'
      const expected = 'ns:grandfather.parent'
      const nested = {
        grandfather: {
          parent: {
            child: 'I am the child',
          },
        },
      }
      const { container } = render(
        <TestEnglish namespaces={{ ns: nested }} i18nKey={i18nKey} />
      )
      expect(container.textContent).toContain(expected)
    })

    test('should return the key as fallback using wrong the very nested translations', () => {
      const i18nKey = 'ns:grandfather.parent.this.is.very.nested.example'
      const expected = 'ns:grandfather.parent.this.is.very.nested.example'
      const nested = {
        grandfather: {
          parent: {
            child: 'I am the child',
          },
        },
      }
      const { container } = render(
        <TestEnglish namespaces={{ ns: nested }} i18nKey={i18nKey} />
      )
      expect(container.textContent).toContain(expected)
    })

    test('should return the key as fallback WITH PROVIDER', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const test = t('ns:template-string')
        return (
          <>
            {test} | {typeof test}
          </>
        )
      }

      const expected = 'ns:template-string | string'

      const { container } = render(
        <I18nProvider lang="en" namespaces={{}}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })

    test('should return the key as fallback WITHOUT PROVIDER', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const test = t('ns:template-string')
        return (
          <>
            {test} | {typeof test}
          </>
        )
      }

      const expected = 'ns:template-string | string'

      const { container } = render(<Inner />)
      expect(container.textContent).toBe(expected)
    })

    test('should return the key as fallback using a template string WITH PROVIDER', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const test = t`ns:template-string`
        return (
          <>
            {test} | {typeof test}
          </>
        )
      }

      const expected = 'ns:template-string | string'

      const { container } = render(
        <I18nProvider lang="en" namespaces={{}}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })

    test('should return the key as fallback using a template string WITHOUT PROVIDER', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const test = t`ns:template-string`
        return (
          <>
            {test} | {typeof test}
          </>
        )
      }

      const expected = 'ns:template-string | string'

      const { container } = render(<Inner />)
      expect(container.textContent).toBe(expected)
    })
  })

  describe('nested', () => {
    test('should work with nested keys', () => {
      const i18nKey = 'ns:grandfather.parent.child'
      const expected = 'I am the child'
      const nested = {
        grandfather: {
          parent: {
            child: expected,
          },
        },
      }
      const { container } = render(
        <TestEnglish namespaces={{ ns: nested }} i18nKey={i18nKey} />
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with nested keys + plural', () => {
      const i18nKey = 'ns:grandfather.parent.child'
      const expected = 'Plural! 2'
      const nested = {
        grandfather: {
          parent: {
            child: 'Singular {{count}}',
            child_plural: 'Plural! {{count}}',
          },
        },
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: nested }}
          i18nKey={i18nKey}
          query={{ count: 2 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with nested keys + count=1', () => {
      const i18nKey = 'ns:grandfather.parent.child'
      const expected = 'One! 1'
      const nested = {
        grandfather: {
          parent: {
            child: 'Singular {{count}}',
            child_1: 'One! {{count}}',
          },
        },
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: nested }}
          i18nKey={i18nKey}
          query={{ count: 1 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })
  })

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

    test('should work as a template string', () => {
      const Inner = () => {
        const { t } = useTranslation()
        return t`ns:template-string`
      }

      const expected = 'Example with template string'
      const templateString = {
        'template-string': 'Example with template string',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })
  })

  describe('options', () => {
    test('should work with returnObjects option and Array locale', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const items = t('ns:template-array', {}, { returnObjects: true })
        return <>{items.map((i) => `${i.title} `)}</>
      }

      const expected = 'Title 1 Title 2 Title 3'
      const templateString = {
        'template-array': [
          { title: 'Title 1' },
          { title: 'Title 2' },
          { title: 'Title 3' },
        ],
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with returnObjects option and Object locale', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const { title, description } = t(
          'ns:template-object',
          {},
          { returnObjects: true }
        )
        return <>{`${title} ${description}`}</>
      }

      const expected = 'Title 1 Description 1'
      const templateString = {
        'template-object': {
          title: 'Title 1',
          description: 'Description 1',
        },
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })
    test('should work with returnObjects option and Object locale with interpolation', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const { title, description } = t(
          'ns:template-object-interpolation',
          { count: 2, something: 'of title' },
          { returnObjects: true }
        )
        return <>{`${title} ${description}`}</>
      }

      const expected = 'Title 2 Description of title'
      const templateString = {
        'template-object-interpolation': {
          title: 'Title {{count}}',
          description: 'Description {{something}}',
        },
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })
    test('should work with returnObjects option and Object locale with interpolation and highly nested object', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const {
          title,
          description,
          template: {
            parent: { child },
          },
        } = t(
          'ns:template-object-interpolation',
          { count: 2, something: 'of title', childTitle: '4' },
          { returnObjects: true }
        )
        return <>{`${title} ${description} ${child.title}`}</>
      }

      const expected = 'Title 2 Description of title Child title 4'
      const templateString = {
        'template-object-interpolation': {
          title: 'Title {{count}}',
          description: 'Description {{something}}',
          template: {
            parent: {
              child: {
                title: 'Child title {{childTitle}}',
              },
            },
          },
        },
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })
  })
})
