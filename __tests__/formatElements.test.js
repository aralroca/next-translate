import { tagParsingRegex } from '../src/formatElements'

describe('formatElements', () => {
  describe('tagParsingRegex', () => {
    it('should match tags in text', () => {
      const match = 'foo<p>bar</p>baz'.match(tagParsingRegex)
      expect(match[0]).toBe('<p>bar</p>')
      expect(match[1]).toBe('p')
      expect(match[2]).toBe('bar')
      expect(match[3]).toBe(undefined)
    })
    it('should match empty tags', () => {
      const match = 'foo<p></p>baz'.match(tagParsingRegex)
      expect(match[0]).toBe('<p></p>')
      expect(match[1]).toBe('p')
      expect(match[2]).toBe('')
      expect(match[3]).toBe(undefined)
    })
    it('should match self closing tags without spaces', () => {
      const match = 'foo<p/>baz'.match(tagParsingRegex)
      expect(match[0]).toBe('<p/>')
      expect(match[1]).toBe(undefined)
      expect(match[2]).toBe(undefined)
      expect(match[3]).toBe('p')
    })
    it('should match self closing tags with spaces', () => {
      const match = 'foo<p />baz'.match(tagParsingRegex)
      expect(match[0]).toBe('<p />')
      expect(match[1]).toBe(undefined)
      expect(match[2]).toBe(undefined)
      expect(match[3]).toBe('p')
    })
    it('should match first occurrence of a tag when input has several', () => {
      const match = 'foo<a>bar</a><b>baz</b>'.match(tagParsingRegex)
      expect(match[0]).toBe('<a>bar</a>')
      expect(match[1]).toBe('a')
      expect(match[2]).toBe('bar')
      expect(match[3]).toBe(undefined)
    })
    it('should match first occurrence of a tag when they are nested', () => {
      const match = 'foo<a>bar<b>baz</b>foobar</a>qux'.match(tagParsingRegex)
      expect(match[0]).toBe('<a>bar<b>baz</b>foobar</a>')
      expect(match[1]).toBe('a')
      expect(match[2]).toBe('bar<b>baz</b>foobar')
      expect(match[3]).toBe(undefined)
    })
    it('should tolerate spaces in regular tags too', () => {
      const match = 'foo<a >bar</a >baz'.match(tagParsingRegex)
      expect(match[0]).toBe('<a >bar</a >')
      expect(match[1]).toBe('a')
      expect(match[2]).toBe('bar')
      expect(match[3]).toBe(undefined)
    })
  })
})
