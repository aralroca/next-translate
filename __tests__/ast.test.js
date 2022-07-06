import generate from '@babel/generator'
import * as babelParser from '@babel/parser'
import { identifier } from '@babel/types'
import { removeNamedExport } from '../src/plugin/ast'
import removeNamedExportTestCases from './removeNamedExport.testCases'
import { clean } from './templateWith.utils'

describe('ast', () => {
  describe('removeNamedExport', () => {
    test.each(removeNamedExportTestCases)(
      '$name',
      ({ code, localName = 'namedExport' }) => {
        const ast = babelParser.parse(code, { sourceType: 'module' })
        const localIdentifier = removeNamedExport(
          ast.program.body,
          identifier('namedExport')
        )

        expect(localIdentifier).toEqual(
          expect.objectContaining(identifier(localName))
        )
        expect(clean(generate(ast).code)).toMatchSnapshot()
      }
    )
  })
})
