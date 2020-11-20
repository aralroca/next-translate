import React from 'react'
import { render, cleanup } from '@testing-library/react'
import I18nProvider from '../src/I18nProvider'
import Trans from '../src/Trans'

const TestEnglish = ({ namespaces, logger, ...props }) => {
  return (
    <I18nProvider lang="en" namespaces={namespaces} logger={logger}>
      <Trans {...props} />
    </I18nProvider>
  )
}

describe('Trans', () => {
  afterEach(cleanup)

  describe('without components', () => {
    test('should work the same way than useTranslate', () => {
      const i18nKey = 'ns:number'
      const expected = 'The number is 42'
      const withSingular = {
        number: 'The number is {{ num }}',
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          values={{ num: 42 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })

    test('should work with nested keys', () => {
      const i18nKey = 'ns:parent.child'
      const expected = 'The number is 42'
      const withSingular = {
        parent: {
          child: 'The number is {{ num }}',
        },
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          values={{ num: 42 }}
        />
      )
      expect(container.textContent).toContain(expected)
    })
  })

  describe('with components', () => {
    test('should work with HTML5 Elements', () => {
      const i18nKey = 'ns:number'
      const expectedText = 'The number is 42'
      const expectedHTML = '<h1 id="u1">The number is <b id="u2">42</b></h1>'
      const withSingular = {
        number: '<0>The number is <1>{{ num }}</1></0>',
      }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          values={{ num: 42 }}
          components={[<h1 id="u1" />, <b id="u2" />]}
        />
      )
      expect(container.textContent).toContain(expectedText)
      expect(container.innerHTML).toContain(expectedHTML)
    })

    test('should work with React Components', () => {
      const i18nKey = 'ns:number'
      const expectedText = 'The number is 42'
      const expectedHTML = '<h1>The number is <b>42</b></h1>'
      const withSingular = {
        number: '<0>The number is <1>{{ num }}</1></0>',
      }
      const H1 = (p) => <h1 {...p} />
      const B = (p) => <b {...p} />

      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          values={{ num: 42 }}
          components={[<H1 />, <B />]}
        />
      )
      expect(container.textContent).toContain(expectedText)
      expect(container.innerHTML).toContain(expectedHTML)
    })

    test('should work with very nested components', () => {
      const i18nKey = 'ns:number'
      const expectedText = 'Is the number 42?'
      const expectedHTML = '<div><p>Is</p> <b>the <i>number</i></b> 42?</div>'
      const withSingular = {
        number: '<0><1>Is</1> <2>the <3>number</3></2> {{num}}?</0>',
      }

      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          values={{ num: 42 }}
          components={[<div />, <p />, <b />, <i />]}
        />
      )
      expect(container.textContent).toContain(expectedText)
      expect(container.innerHTML).toContain(expectedHTML)
    })

    test('should work without replacing the HTMLElement if the index is incorrectly', () => {
      const i18nKey = 'common:test-html'
      const expectedHTML = 'test with bad index.'
      const common = {
        'test-html': 'test <10>with bad index</10>.',
      }

      const { container } = render(
        <TestEnglish
          namespaces={{ common }}
          i18nKey={i18nKey}
          components={[<b />]}
        />
      )
      expect(container.innerHTML).toContain(expectedHTML)
    })
  })

  describe('components prop as a object', () => {
    test('should work with component as a object', () => {
      const i18nKey = 'common:test-html'
      const expectedHTML = 'test <b>components as a object</b>.'
      const common = {
        'test-html': 'test <example>components as a object</example>.',
      }

      const { container } = render(
        <TestEnglish
          namespaces={{ common }}
          i18nKey={i18nKey}
          components={{ example: <b /> }}
        />
      )
      expect(container.innerHTML).toContain(expectedHTML)
    })

    test('should work with component as a object of React Components', () => {
      const i18nKey = 'common:test-html'
      const expectedHTML = 'test <b class="test">components as a object</b>.'
      const common = {
        'test-html': 'test <example>components as a object</example>.',
      }

      const Component = ({ children }) => <b className="test">{children}</b>

      const { container } = render(
        <TestEnglish
          namespaces={{ common }}
          i18nKey={i18nKey}
          components={{ example: <Component /> }}
        />
      )
      expect(container.innerHTML).toContain(expectedHTML)
    })

    test('should work with component as a object without replacing the HTMLElement if the key is incorrectly', () => {
      const i18nKey = 'common:test-html'
      const expectedHTML =
        'test <b class="test">components as <u>a</u> object</b>.'
      const common = {
        'test-html':
          'test <example>components <thisIsIncorrect>as <u>a</u> object</thisIsIncorrect></example>.',
      }

      const Component = ({ children }) => <b className="test">{children}</b>

      const { container } = render(
        <TestEnglish
          namespaces={{ common }}
          i18nKey={i18nKey}
          components={{ example: <Component />, u: <u /> }}
        />
      )
      expect(container.innerHTML).toContain(expectedHTML)
    })
  })

  describe('logger', () => {
    test('should log a warn key if a key does not exist in the namespace', () => {
      console.warn = jest.fn()
      const i18nKey = 'ns:number'
      const expected =
        '[next-translate] "ns:number" is missing in current namespace configuration. Try adding "number" to the namespace "ns".'

      const withSingular = {}
      render(
        <TestEnglish namespaces={{ ns: withSingular }} i18nKey={i18nKey} />
      )
      expect(console.warn).toBeCalledWith(expected)
    })

    test('should log a warn key if it has a fallback', () => {
      console.warn = jest.fn()
      const i18nKey = 'ns:number'
      const expected =
        '[next-translate] "ns:number" is missing in current namespace configuration. Try adding "number" to the namespace "ns".'

      const withSingular = { fllbck: 'Im a fallback' }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          fallback={['ns:fllbck']}
        />
      )
      expect(console.warn).toBeCalledWith(expected)
      expect(container.innerHTML).toContain('Im a fallback')
    })

    test('should log a warn key multiple times if all fallbacks are also missing', () => {
      console.warn = jest.fn()
      const i18nKey = 'ns:number'
      const expected =
        '[next-translate] "ns:number" is missing in current namespace configuration. Try adding "number" to the namespace "ns".'

      const withSingular = { fallback4: 'Im a fallback number 4' }
      const { container } = render(
        <TestEnglish
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
          fallback={[
            'ns:fallback1',
            'ns:fallback2',
            'ns:fallback3',
            'ns:fallback4',
          ]}
        />
      )
      expect(console.warn).toBeCalledWith(expected)
      expect(console.warn.mock.calls.length).toBe(4)
      expect(container.innerHTML).toContain('Im a fallback number 4')
    })

    test('should log correctly if the value includes a ":", for example an URL', () => {
      console.warn = jest.fn()
      const i18nKey = 'ns:https://linkinsomelanguage.com'
      const expected =
        '[next-translate] "ns:https://linkinsomelanguage.com" is missing in current namespace configuration. Try adding "https://linkinsomelanguage.com" to the namespace "ns".'

      const withSingular = {}
      render(
        <TestEnglish namespaces={{ ns: withSingular }} i18nKey={i18nKey} />
      )
      expect(console.warn).toBeCalledWith(expected)
    })

    test('should not log when the translation have ":" inside', () => {
      console.warn = jest.fn()
      const i18nKey = 'Some text without namespace'
      const expected =
        '[next-translate] The text "Some text without namespace" has no namespace in front of it.'

      const withSingular = {}
      render(
        <TestEnglish namespaces={{ ns: withSingular }} i18nKey={i18nKey} />
      )
      expect(console.warn).toBeCalledWith(expected)
    })

    test('should log a warn key if a nested key does not exist in the namespace', () => {
      console.warn = jest.fn()
      const i18nKey = 'ns:parent.child'
      const expected =
        '[next-translate] "ns:parent.child" is missing in current namespace configuration. Try adding "parent.child" to the namespace "ns".'

      const withSingular = {}
      render(
        <TestEnglish namespaces={{ ns: withSingular }} i18nKey={i18nKey} />
      )
      expect(console.warn).toBeCalledWith(expected)
    })

    test('should pass the key and the namespace to the logger function if the key does not exist in the namespace', () => {
      console.log = jest.fn()
      const i18nKey = 'ns:number'
      const logger = ({ i18nKey, namespace }) =>
        console.log(`Logger: ${i18nKey} ${namespace}`)
      const expected = 'Logger: number ns'

      const withSingular = {}
      render(
        <TestEnglish
          logger={logger}
          namespaces={{ ns: withSingular }}
          i18nKey={i18nKey}
        />
      )
      expect(console.log).toBeCalledWith(expected)
    })
  })
})
