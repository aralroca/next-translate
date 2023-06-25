import React, { useState } from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
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

    test('interpolation should not be lazy', () => {
      const Inner = () => {
        const { t } = useTranslation()
        return t('common:key', {
          something: 'something',
          somethingElse: 'something else',
        })
      }

      const expected = 'something else'

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ common: { key: '{{somethingElse}}' } }}
        >
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

    test('should work with custom nsSeparator', () => {
      const Inner = () => {
        const { t } = useTranslation('a')
        return t`b||test`
      }

      const ns = {
        a: { test: 'Test from A' },
        b: { test: 'Test from B' },
      }

      const expected = 'Test from B'

      const { container } = render(
        <I18nProvider lang="en" namespaces={ns} config={{ nsSeparator: '||' }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })

    test('should work with natural text as key and defaultNS', () => {
      const Inner = () => {
        const { t } = useTranslation()
        return t`progress: loading...`
      }

      const ns = {
        a: { 'progress: loading...': 'progression: chargement...' },
      }

      const expected = 'progression: chargement...'

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={ns}
          config={{ nsSeparator: false, keySeparator: false, defaultNS: 'a' }}
        >
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })

    test('should work with flat key', () => {
      const Inner = () => {
        const { t } = useTranslation('a')
        return t`this.is.a.flat.key`
      }

      const ns = {
        a: { 'this.is.a.flat.key': 'works' },
      }

      const expected = 'works'

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={ns}
          config={{ keySeparator: false }}
        >
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

    test('should work with singular | count=1', () => {
      const i18nKey = 'ns:withsingular'
      const expected = 'The number is NOT ZERO'
      const withSingular = {
        withsingular_one: 'The number is NOT ZERO',
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

    test('should work with plural | count=0', () => {
      const i18nKey = 'ns:withsingular'
      const expected = 'The number is ZERO'
      const withSingular = {
        withsingular_one: 'The number is NOT ZERO',
        withsingular_other: 'The number is ZERO!',
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

    test('should work with _zero for ar language | count=0', () => {
      const Inner = () => {
        const { t } = useTranslation()
        return t('ns:withplural', { count: 0 })
      }

      const expected = 'The number is zero'
      const templateString = {
        withplural_zero: 'The number is zero',
        withplural_2: 'The number is TWO!',
        withplural_other: 'Number is bigger than one!',
      }

      const { container } = render(
        <I18nProvider lang="ar" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with _one for fr language | count=0', () => {
      const Inner = () => {
        const { t } = useTranslation()
        return t('ns:withplural', { count: 0 })
      }

      const expected = 'The number is zero'
      const templateString = {
        withplural_one: 'The number is zero',
        withplural_2: 'The number is TWO!',
        withplural_other: 'Number is bigger than one!',
      }

      const { container } = render(
        <I18nProvider lang="fr" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
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

    test('should update value when using dynamic query with returnObjects', async () => {
      const templateString = {
        'template-array': [{ title: 'Title {{number}}' }],
      }
      const Inner = () => {
        const [number, setNumber] = useState(1)
        const { t } = useTranslation()
        const items = t(
          'ns:template-array',
          { number },
          { returnObjects: true }
        )

        return (
          <>
            {items.map((i) => `${i.title} `)}{' '}
            <button id="btn" onClick={() => setNumber(2)}>
              click
            </button>
          </>
        )
      }

      const { container, getByText } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )

      expect(container.textContent).toContain('Title 1')

      // trigger for update value
      fireEvent.click(getByText('click'))

      expect(container.textContent).not.toContain('Title 1')
      expect(container.textContent).toContain('Title 2')
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
    test('should work with returnObjects option and Object locale with default property', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const { title, description } = t(
          'ns:template-object-default',
          { count: 2, something: 'of title' },
          {
            returnObjects: true,
            default: {
              title: 'Default title',
              description: 'Default description',
            },
          }
        )
        return <>{`${title} ${description}`}</>
      }

      const expected = 'Default title Default description'

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: {} }}>
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
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:template-object-interpolation', {
          count: 3,
          something: 'cats',
        })
        return <>{text}</>
      }

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
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('should support alternative interpolation without suffix', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:template-object-interpolation', {
          count: 3,
          something: 'cats',
        })
        return <>{text}</>
      }

      const expected = 'There are 3 cats.'
      const templateString = {
        'template-object-interpolation': 'There are :count :something.',
      }

      const config = {
        interpolation: {
          prefix: ':',
          suffix: '',
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner />
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

    test('should allow default translation', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:no-translation', undefined, {
          default: 'This is a default translation',
        })
        return <>{text}</>
      }

      const expected = 'This is a default translation'
      const templateString = {}

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })

    test('should allow default translation with fallback as string', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:no-translation', undefined, {
          default: 'This is a default translation',
          fallback: 'ns:no-translation2',
        })
        return <>{text}</>
      }

      const expected = 'This is a default translation'

      const { container } = render(
        <I18nProvider lang="en" namespaces={{}}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })

    test('should allow default translation with fallback as array of strings', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:no-translation', undefined, {
          default: 'This is a default translation',
          fallback: ['ns:no-translation2', 'ns:no-translation3'],
        })
        return <>{text}</>
      }

      const expected = 'This is a default translation'

      const { container } = render(
        <I18nProvider lang="en" namespaces={{}}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })

    test('should allow default translation with interpolation', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t(
          'ns:no-translation',
          { count: 3 },
          {
            default: 'This is a default translation with a count: {{count}}',
            fallback: 'ns:no-translation2',
          }
        )
        return <>{text}</>
      }

      const expected = 'This is a default translation with a count: 3'

      const { container } = render(
        <I18nProvider lang="en" namespaces={{}}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })
    test('should allow default object translation with interpolation', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t(
          'ns:no-translation',
          { count: 3 },
          {
            default: {
              example: 'This is a default translation with a count: {{count}}',
            },
            returnObjects: true,
            fallback: 'ns:no-translation2',
          }
        )
        return <>{text.example}</>
      }

      const expected = 'This is a default translation with a count: 3'

      const { container } = render(
        <I18nProvider lang="en" namespaces={{}}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })
    test('should allow default array translation with interpolation', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t(
          'ns:no-translation',
          { count: 3 },
          {
            default: ['This is a default translation with a count: {{count}}'],
            returnObjects: true,
            fallback: 'ns:no-translation2',
          }
        )
        return <>{text[0]}</>
      }

      const expected = 'This is a default translation with a count: 3'

      const { container } = render(
        <I18nProvider lang="en" namespaces={{}}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })
    test('should return falsey default values', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t(
          'ns:no-translation',
          { count: 3 },
          {
            default: undefined,
            returnObjects: true,
            fallback: 'ns:no-translation2',
          }
        )
        return <>{`${text}`}</>
      }

      const expected = 'undefined'

      const { container } = render(
        <I18nProvider lang="en" namespaces={{}}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toBe(expected)
    })
  })

  describe('interpolation', () => {
    test('works with spaces', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:interpolation', {
          count: 3,
        })
        return <>{text}</>
      }

      const expected = 'There are 3 cats.'
      const templateString = {
        interpolation: 'There are {{   count }} cats.',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('works with empty format', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:interpolation', {
          count: 3,
        })
        return <>{text}</>
      }

      const expected = 'There are 3 cats.'
      const templateString = {
        interpolation: 'There are {{count, }} cats.',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('uses configured formatter', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:interpolation', {
          count: 3,
        })
        return <>{text}</>
      }

      const expected = 'There are <number(en)>3</number(en)> cats.'
      const templateString = {
        interpolation: 'There are {{count, number}} cats.',
      }

      const config = {
        interpolation: {
          format: (value, format, lang) => {
            const tag = `${format}(${lang})`
            return `<${tag}>${value}</${tag}>`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('uses configured formatter with an object', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:interpolation', {
          count: { value: 3 },
        })
        return <>{text}</>
      }

      const expected = 'There are <object(en)>3</object(en)> cats.'
      const templateString = {
        interpolation: 'There are {{count, object}} cats.',
      }

      const config = {
        interpolation: {
          format: (v, format, lang) => {
            const tag = `${format}(${lang})`
            return `<${tag}>${v.value}</${tag}>`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('replaces all parameters', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:interpolation', {
          cats: 3,
          dogs: 3,
          total: 6,
          object: 'house',
        })
        return <>{text}</>
      }

      const expected =
        'There are <digits-en>3</digits-en> dogs and <number-en>3</number-en> cats in this house, that are <number-en>6</number-en> animals.'
      const templateString = {
        interpolation:
          'There are {{dogs, digits}} dogs and {{cats, number}} cats in this {{object}}, that are {{total, number}} animals.',
      }

      const config = {
        interpolation: {
          format: (value, format, lang) => {
            const tag = `${format}-${lang}`
            return `<${tag}>${value}</${tag}>`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('format allows spaces, hyphens and (upper-case) letters', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:interpolation', {
          count: 3,
        })
        return <>{text}</>
      }

      const expected = 'There are <to-numBer(en)>3</to-numBer(en)> cats.'
      const templateString = {
        interpolation: 'There are {{count,to-numBer  }} cats.',
      }

      const config = {
        interpolation: {
          format: (value, format, lang) => {
            const tag = `${format}(${lang})`
            return `<${tag}>${value}</${tag}>`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })

    test('skips invalid format', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:interpolation', {
          count: 3,
        })
        return <>{text}</>
      }

      const templateString = {
        interpolation: 'There are {{count, .number}} cats.',
      }

      const config = {
        interpolation: {
          format: (value, format, lang) => {
            const tag = `${format}(${lang})`
            return `<${tag}>${value}</${tag}>`
          },
        },
      }

      const { container } = render(
        <I18nProvider
          lang="en"
          namespaces={{ ns: templateString }}
          config={config}
        >
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(templateString.interpolation)
    })

    test('works without formatter', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:interpolation', {
          count: 3,
        })
        return <>{text}</>
      }

      const expected = 'There are 3 cats.'
      const templateString = {
        interpolation: 'There are {{count, number}} cats.',
      }

      const { container } = render(
        <I18nProvider lang="en" namespaces={{ ns: templateString }}>
          <Inner />
        </I18nProvider>
      )
      expect(container.textContent).toContain(expected)
    })
  })

  describe('Next.js 13 app-dir', () => {
    test('should work without context (with globalThis.__NEXT_TRANSLATE__)', () => {
      const Inner = () => {
        const { t } = useTranslation()
        const text = t('ns:interpolation', {
          count: 3,
        })
        return <>{text}</>
      }

      const expected = 'There are 3 cats.'

      globalThis.__NEXT_TRANSLATE__ = {
        namespaces: {
          ns: {
            interpolation: 'There are {{count}} cats.',
          },
        },
        lang: 'en',
        config: {},
      }

      const { container } = render(<Inner />)
      expect(container.textContent).toContain(expected)
    })
  })
})
