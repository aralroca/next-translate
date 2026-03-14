import React, { Fragment } from 'react'
import formatElements, { tagParsingRegex } from '../src/formatElements'

describe('formatElements', () => {
  describe('tagParsingRegex', () => {
    it('should match tags in text', () => {
      const match = 'foo<p>bar</p>baz'.match(tagParsingRegex)
      expect(match[0]).toBe('<p>bar</p>')
      expect(match[1]).toBe('p')
      expect(match[2]).toBe('')
      expect(match[3]).toBe('bar')
    })
    it('should match tags with attributes', () => {
      const match = 'foo<a href="/bar">baz</a>qux'.match(tagParsingRegex)
      expect(match[0]).toBe('<a href="/bar">baz</a>')
      expect(match[1]).toBe('a')
      expect(match[2]).toBe(' href="/bar"')
      expect(match[3]).toBe('baz')
    })
    it('should match empty tags', () => {
      const match = 'foo<p></p>baz'.match(tagParsingRegex)
      expect(match[0]).toBe('<p></p>')
      expect(match[1]).toBe('p')
      expect(match[2]).toBe('')
      expect(match[3]).toBe('')
    })
    it('should match self closing tags without spaces', () => {
      const match = 'foo<p/>baz'.match(tagParsingRegex)
      expect(match[0]).toBe('<p/>')
      expect(match[4]).toBe('p')
      expect(match[5]).toBe('')
    })
    it('should match self closing tags with spaces', () => {
      const match = 'foo<p />baz'.match(tagParsingRegex)
      expect(match[0]).toBe('<p />')
      expect(match[4]).toBe('p')
      expect(match[5]).toBe(' ')
    })
    it('should match self closing tags with attributes', () => {
      const match = 'foo<img src="bar.png" />baz'.match(tagParsingRegex)
      expect(match[0]).toBe('<img src="bar.png" />')
      expect(match[4]).toBe('img')
      expect(match[5]).toBe(' src="bar.png" ')
    })
    it('should match first occurrence of a tag when input has several', () => {
      const match = 'foo<a>bar</a><b>baz</b>'.match(tagParsingRegex)
      expect(match[0]).toBe('<a>bar</a>')
      expect(match[1]).toBe('a')
      expect(match[3]).toBe('bar')
    })
    it('should match first occurrence of a tag when they are nested', () => {
      const match = 'foo<a>bar<b>baz</b>foobar</a>qux'.match(tagParsingRegex)
      expect(match[0]).toBe('<a>bar<b>baz</b>foobar</a>')
      expect(match[1]).toBe('a')
      expect(match[3]).toBe('bar<b>baz</b>foobar')
    })
    it('should tolerate spaces in regular tags too', () => {
      const match = 'foo<a >bar</a >baz'.match(tagParsingRegex)
      expect(match[0]).toBe('<a >bar</a >')
      expect(match[1]).toBe('a')
      expect(match[2]).toBe(' ')
      expect(match[3]).toBe('bar')
    })
  })

  describe('formatElements function', () => {
    it('should inject href from attributes into React component', () => {
      const components = {
        a: <a className="link" />,
      }
      const text = 'Click <a href="/home">here</a>'
      const result = formatElements(text, components)

      expect(result[1].type).toBe('a')
      expect(result[1].props.href).toBe('/home')
      expect(result[1].props.className).toBe('link')
      expect(result[1].props.children).toBe('here')
    })

    it('should support self-closing tags with attributes', () => {
      const components = {
        br: <br />,
      }
      const text = 'line1<br />line2'
      const result = formatElements(text, components)
      expect(result).toHaveLength(3)
      expect(result[1].type).toBe('br')
    })
  })
})
