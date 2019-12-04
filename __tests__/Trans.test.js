import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { I18nProvider } from '../src'
import { Trans } from '../src'

const TestEnglish = ({  namespaces, ...props }) => {
  return (
    <I18nProvider lang="en" namespaces={namespaces} >
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
        'number': 'The number is {{ num }}',
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
      const expectedHTML = '<h1 id=\"u1\">The number is <b id=\"u2\">42</b></h1>'
      const withSingular = {   
        'number': '<0>The number is <1>{{ num }}</1></0>',
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
        'number': '<0>The number is <1>{{ num }}</1></0>',
      }
      const H1 = p => <h1 {...p} />
      const B = p => <b {...p} />

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
        'number': '<0><1>Is</1> <2>the <3>number</3></2> {{num}}?</0>',
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
  })
})
