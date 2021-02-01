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
  beforeAll(() => {
    console.warn = jest.fn()
  })

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

    test('should work with a defined default namespace | t as template string', () => {
      const Inner = () => {
        const { t } = useTranslation('a')
        return (
          <>
            {t`test`} {t`b:test`}
          </>
        )
      }

      const ns = {
        a: { test: 'Test from A' },
        b: { test: 'Test from B' },
      }

      const expected = 'Test from A Test from B'

      const { container } = render(
        <I18nProvider lang="en" namespaces={ns}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })

    test('should work with a defined default namespace | t as function', () => {
      const Inner = () => {
        const { t } = useTranslation('a')
        return (
          <>
            {t('test')} {t('b:test')}
          </>
        )
      }

      const ns = {
        a: { test: 'Test from A' },
        b: { test: 'Test from B' },
      }

      const expected = 'Test from A Test from B'

      const { container } = render(
        <I18nProvider lang="en" namespaces={ns}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })

    test('should work with fallbacks that depend on the defined default namespace | t as function', () => {
      const Inner = () => {
        const { t } = useTranslation('a')

        return (
          <>
            {t('test')} {t('unknown', {}, { fallback: 'fallback' })}
          </>
        )
      }

      const ns = {
        a: {
          test: 'Test text',
          fallback: 'Fallback text',
        },
      }

      const expected = 'Test text Fallback text'

      const { container } = render(
        <I18nProvider lang="en" namespaces={ns}>
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
            child_other: 'Plural! {{count}}',
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

    test('should work with singular | count=0', () => {
      const i18nKey = 'ns:withsingular'
      const expected = 'The number is NOT ONE'
      const withSingular = {
        withsingular: 'The number is NOT ONE',
        withsingular_1: 'The number is ONE!',
        withsingular_other: 'Oops!',
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

    describe('nested', () => {
      test('should work with 0 | count=0', () => {
        const i18nKey = 'ns:withzero'
        const expected = 'The number is ZERO!'
        const with_0 = {
          withzero: {
            one: 'The number is NOT ZERO',
            other: 'The number is not ZERO!',
            0: 'The number is ZERO!',
          },
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

      test('should work with zero | count=0', () => {
        const i18nKey = 'ns:withzero'
        const expected = 'The number is ZERO!'
        const with_0 = {
          withzero: {
            one: 'The number is NOT ZERO',
            other: 'The number is ZERO!',
          },
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

      test('should work with singular | count=1', () => {
        const i18nKey = 'ns:withsingular'
        const expected = 'The number is NOT ZERO'
        const withSingular = {
          withsingular: {
            one: 'The number is NOT ZERO',
            other: 'Oops!',
          },
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

      test('should work with 1 | count=1', () => {
        const i18nKey = 'ns:withsingular'
        const expected = 'The number is NOT ZERO'
        const withSingular = {
          withsingular: {
            1: 'The number is NOT ZERO',
            other: 'Oops!',
          },
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

      test('should work with plural | count=2', () => {
        const i18nKey = 'ns:withplural'
        const expected = 'Number is bigger than one!'
        const withPlural = {
          withplural: {
            one: 'Singular',
            other: 'Number is bigger than one!',
          },
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

      test('should work with 2 | count=2', () => {
        const i18nKey = 'ns:withplural'
        const expected = 'Number is 2!'
        const withPlural = {
          withplural: {
            one: 'Singular',
            2: 'Number is 2!',
            other: 'Number is bigger than one!',
          },
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

    test('should work fallback as string', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const description = t('ns:description2', {}, { fallback: 'ns:title' })
        return <>{description}</>
      }

      const expected = 'Title 1'
      const ns = {
        title: 'Title 1',
        description: 'Description 1',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work fallback as array of strings', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const description = t(
          'ns:description2',
          {},
          { fallback: ['ns:noexistent', 'ns:title'] }
        )
        return <>{description}</>
      }

      const expected = 'Title 1'
      const ns = {
        title: 'Title 1',
        description: 'Description 1',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('should ignore fallback if is not an array of string or string | array of objects', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const description = t(
          'ns:description2',
          {},
          { fallback: [{}, 'ns:title'] }
        )
        return <>{description}</>
      }

      const expected = 'ns:description2'
      const ns = {
        title: 'Title 1',
        description: 'Description 1',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('should ignore fallback if is not an array of string or string | object', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const description = t('ns:description2', {}, { fallback: {} })
        return <>{description}</>
      }

      const expected = 'ns:description2'
      const ns = {
        title: 'Title 1',
        description: 'Description 1',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work fallback with returnObjects option and Object locale with interpolation', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const { title, description } = t(
          'ns:noexistent',
          { count: 2, something: 'of title' },
          {
            returnObjects: true,
            fallback: ['ns:blabla', 'ns:template-object-interpolation'],
          }
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

    test('should support alternative interpolation delimeter options', () => {
      const expected = 'There are 3 cats.'
      const templateString = {
        'template-object-interpolation': 'There are ${count} ${something}.',
      }

      const config = {
        interpolation: {
          prefix: '${',
          suffix: '}',
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner
            i18nKey="ns:template-object-interpolation"
            query={{
              count: 3,
              something: 'cats',
            }}
          />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })
  })

  describe('interpolation', () => {
    test('works with spaces in the pattern', () => {
      const expected = 'There are 3 cats.'
      const templateString = {
        interpolation: 'There are {{   count }} cats.',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner i18nKey="ns:interpolation" query={{ count: 3 }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('works with empty format', () => {
      const expected = 'There are 3 cats.'
      const templateString = {
        interpolation: 'There are {{count, }} cats.',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner i18nKey="ns:interpolation" query={{ count: 3 }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('works with undefined parameter', () => {
      const expected = 'Got undefined here.'
      const templateString = {
        interpolation: 'Got {{something}} here.',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner i18nKey="ns:interpolation" query={{ something: undefined }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('works with null parameter', () => {
      const expected = 'Got null here.'
      const templateString = {
        interpolation: 'Got {{something}} here.',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner i18nKey="ns:interpolation" query={{ something: null }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('works with boolean parameter', () => {
      const expected = 'Got true here.'
      const templateString = {
        interpolation: 'Got {{something}} here.',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner i18nKey="ns:interpolation" query={{ something: true }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('works with object parameter', () => {
      const now = new Date()

      // even when the given parameter is no string it will still be casted
      const expected = `Now it's ${now.toString()}.`
      const templateString = {
        interpolation: "Now it's {{date}}.",
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner i18nKey="ns:interpolation" query={{ date: now }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('uses configured formatter', () => {
      const expected = 'There are <number>3</number> cats.'
      const templateString = {
        interpolation: 'There are {{count, number}} cats.',
      }

      const config = {
        interpolation: {
          format: (value, format) => {
            return `<${format}>${value}</${format}>`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner i18nKey="ns:interpolation" query={{ count: 3 }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('formatter can use object parameter', () => {
      const now = new Date()
      const expected = `Now it's ${now.toDateString()}.`
      const templateString = {
        interpolation: "Now it's {{now,date}}.",
      }

      const config = {
        interpolation: {
          format: (value, format) => {
            if (format === 'date') return value.toDateString()
            return `<${format}>${value}</${format}>`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner i18nKey="ns:interpolation" query={{ now }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('works if formatter returns a castable object', () => {
      const now = new Date()

      // the formatter should always return a string, but if it doesn't it still works
      const expected = `Now it's ${now.toString()}.`

      const templateString = {
        interpolation: "Now it's {{now, date}}.",
      }

      const config = {
        interpolation: {
          format: (value, format) => {
            if (format === 'date') return value
            return `<${format}>${value}</${format}>`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner i18nKey="ns:interpolation" query={{ now }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('works if formatter returns any object', () => {
      const now = { time: 'now' }

      // the formatter should always return a string, but if it doesn't it still works
      const expected = `Now it's [object Object].`

      const templateString = {
        interpolation: "Now it's {{now, unchanged}}.",
      }

      const config = {
        interpolation: {
          format: (value, format) => {
            if (format === 'unchanged') return value
            return `<${format}>${value}</${format}>`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner i18nKey="ns:interpolation" query={{ now }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('current locale is provided to the formatter', () => {
      const expected = 'There are en:number:3 cats.'
      const templateString = {
        interpolation: 'There are {{count, number}} cats.',
      }

      const config = {
        interpolation: {
          format: (value, format, locale) => {
            return `${locale}:${format}:${value}`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner i18nKey="ns:interpolation" query={{ count: 3 }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('replaces all parameters', () => {
      const expected =
        'There are <digits>3</digits> dogs and <number>3</number> cats in this house, that are <number>6</number> animals.'
      const templateString = {
        interpolation:
          'There are {{dogs, digits}} dogs and {{cats, number}} cats in this {{object}}, that are {{total, number}} animals.',
      }

      const config = {
        interpolation: {
          format: (value, format) => {
            return `<${format}>${value}</${format}>`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner
            i18nKey="ns:interpolation"
            query={{
              cats: 3,
              dogs: 3,
              total: 6,
              object: 'house',
            }}
          />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('format allows spaces, hyphens and (upper-case) letters', () => {
      const expected = 'There are <to-numBer>3</to-numBer> cats.'
      const templateString = {
        interpolation: 'There are {{count,to-numBer  }} cats.',
      }

      const config = {
        interpolation: {
          format: (value, format) => {
            return `<${format}>${value}</${format}>`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner i18nKey="ns:interpolation" query={{ count: 3 }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('skips invalid format', () => {
      const templateString = {
        interpolation: 'There are {{count, .number}} cats.',
      }

      const formatter = jest.fn()
      const config = {
        interpolation: {
          format: formatter,
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner i18nKey="ns:interpolation" query={{ count: 3 }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(templateString.interpolation)
      expect(formatter).toHaveBeenCalledTimes(0)
    })

    test('works without formatter', () => {
      const expected = 'There are 3 cats.'
      const templateString = {
        interpolation: 'There are {{count, number}} cats.',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner i18nKey="ns:interpolation" query={{ count: 3 }} />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with empty interpolation result', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:empty-interpolation', {
          something: '',
        })
        return <>{text}</>
      }

      const expected = ''
      const templateString = {
        'empty-interpolation': '{{something}}',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })

    test('should allow empty translations', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:empty-translation.nested')
        return <>{text}</>
      }

      const expected = ''
      const templateString = {
        'empty-translation': { nested: '' },
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })
  })
})
