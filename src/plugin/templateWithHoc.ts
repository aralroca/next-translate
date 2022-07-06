import generate from '@babel/generator'
import * as babelParser from '@babel/parser'
import {
  ExportDefaultDeclaration,
  identifier,
  exportDefaultDeclaration,
  Identifier,
  CallExpression,
  callExpression,
  objectExpression,
  spreadElement,
  objectProperty,
  booleanLiteral,
  ObjectExpression,
  variableDeclaration,
  variableDeclarator,
  isExpression,
  importDeclaration,
  importDefaultSpecifier,
  stringLiteral,
  File,
  isExportDefaultDeclaration,
} from '@babel/types'
import { defaultLoaderAst } from './utils'

interface Options
  extends Pick<HocOptions, 'skipInitialProps' | 'hasLoadLocaleFrom'> {
  pageName?: string
}

export default function templateWithHoc(
  ast: babelParser.ParseResult<File>,
  { pageName = '__Page_Next_Translate__', ...hocOptions }: Options = {}
): string {
  const { body } = ast.program

  const defaultExportIndex = body.findIndex((s) =>
    isExportDefaultDeclaration(s)
  )
  if (defaultExportIndex === -1) {
    throw new Error('Missing default export.')
  }

  const { declaration } = body[defaultExportIndex] as ExportDefaultDeclaration

  // function and class declarations could already have a name which is used in the source code, f.e.
  // export default function Page(props) { return null }
  // in this case we have to preserve that name
  const pageId =
    isExpression(declaration) || !declaration.id
      ? identifier(pageName)
      : declaration.id

  // overwrite and thereby remove the default export
  body[defaultExportIndex] = isExpression(declaration)
    ? variableDeclaration('const', [variableDeclarator(pageId, declaration)])
    : declaration

  const i18nConfigId = identifier('__i18nConfig')
  const hocId = identifier('__appWithI18n')

  body.unshift(
    importDeclaration(
      [importDefaultSpecifier(hocId)],
      stringLiteral('next-translate/appWithI18n')
    ),
    importDeclaration(
      [importDefaultSpecifier(i18nConfigId)],
      stringLiteral('@next-translate-root/i18n')
    )
  )

  body.push(
    exportDefaultDeclaration(
      wrapWithHoc(pageId, {
        ...hocOptions,
        hocId,
        i18nConfigId,
      })
    )
  )

  return generate(ast).code
}

interface HocOptions {
  hocId: Identifier
  i18nConfigId: Identifier
  skipInitialProps?: boolean
  hasLoadLocaleFrom?: boolean
}

function wrapWithHoc(
  pageId: Identifier,
  { hocId, i18nConfigId, skipInitialProps, hasLoadLocaleFrom }: HocOptions
): CallExpression {
  const wrapped = callExpression(hocId, [
    pageId,
    objectExpression([
      spreadElement(i18nConfigId),
      objectProperty(identifier('isLoader'), booleanLiteral(true)),
      objectProperty(
        identifier('skipInitialProps'),
        booleanLiteral(Boolean(skipInitialProps))
      ),
    ]),
  ])

  if (!hasLoadLocaleFrom) {
    const options = wrapped.arguments[1] as ObjectExpression
    options.properties.push(
      objectProperty(identifier('loadLocaleFrom'), defaultLoaderAst)
    )
  }

  return wrapped
}
