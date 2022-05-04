import generate from '@babel/generator'
import * as babelParser from '@babel/parser'
import {
  arrayExpression,
  arrayPattern,
  awaitExpression,
  blockStatement,
  callExpression,
  exportNamedDeclaration,
  exportSpecifier,
  File,
  functionDeclaration,
  Identifier,
  identifier,
  importDeclaration,
  importDefaultSpecifier,
  memberExpression,
  numericLiteral,
  ObjectExpression,
  objectExpression,
  ObjectProperty,
  objectProperty,
  returnStatement,
  spreadElement,
  stringLiteral,
  variableDeclaration,
  variableDeclarator,
} from '@babel/types'
import { removeNamedExport } from './ast'
import { defaultLoaderAst } from './utils'

export default function templateWithLoader(
  ast: babelParser.ParseResult<File>,
  {
    page = '',
    loaderId = identifier('getStaticProps'),
    hasLoadLocaleFrom = false,
    revalidate = 0,
  } = {}
) {
  const { body } = ast.program

  const i18nConfigId = identifier('__i18nConfig')
  const loadNamespacesId = identifier('__loadNamespaces')

  body.unshift(
    importDeclaration(
      [importDefaultSpecifier(loadNamespacesId)],
      stringLiteral('next-translate/loadNamespaces')
    ),
    importDeclaration(
      [importDefaultSpecifier(i18nConfigId)],
      stringLiteral('@next-translate-root/i18n')
    )
  )

  const localLoaderId = removeNamedExport(body, loaderId)

  const nextTranslateLoaderId = identifier(`__next_translate_${loaderId.name}`)
  body.push(
    buildNextTranslateLoader({
      nextTranslateLoaderId,
      hasLoadLocaleFrom,
      i18nConfigId,
      loadNamespacesId,
      loaderId,
      page,
      revalidate,
      userLoaderId: localLoaderId,
    })
  )

  body.push(
    exportNamedDeclaration(undefined, [
      exportSpecifier(nextTranslateLoaderId, loaderId),
    ])
  )

  return generate(ast).code
}

interface NextTranslateLoaderOptions {
  nextTranslateLoaderId: Identifier
  userLoaderId: Identifier | null
  loadNamespacesId: Identifier
  i18nConfigId: Identifier
  loaderId: Identifier
  page: string
  hasLoadLocaleFrom: boolean
  revalidate: number
}

function buildNextTranslateLoader({
  nextTranslateLoaderId,
  userLoaderId,
  loadNamespacesId,
  i18nConfigId,
  loaderId,
  page,
  hasLoadLocaleFrom,
  revalidate,
}: NextTranslateLoaderOptions) {
  const contextId = identifier('ctx')

  const loadNamespaces = callExpression(loadNamespacesId, [
    objectExpression([
      spreadElement(contextId),
      objectProperty(identifier('pathname'), stringLiteral(page)),
      objectProperty(identifier('loaderName'), stringLiteral(loaderId.name)),
      spreadElement(i18nConfigId),
    ]),
  ])

  if (!hasLoadLocaleFrom) {
    const argument = loadNamespaces.arguments[0] as ObjectExpression

    argument.properties.push(
      objectProperty(identifier('loadLocaleFrom'), defaultLoaderAst)
    )
  }

  const sharedProperties: ObjectProperty[] = []
  if (revalidate > 0) {
    sharedProperties.push(
      objectProperty(identifier('revalidate'), numericLiteral(revalidate))
    )
  }

  const propsId = identifier('props')
  const userLoaderResultId = identifier('userLoaderResult')
  const namespacePropsId = identifier('namespaceProps')

  const body = userLoaderId
    ? blockStatement([
        variableDeclaration('const', [
          variableDeclarator(
            arrayPattern([userLoaderResultId, namespacePropsId]),
            awaitExpression(
              callExpression(
                memberExpression(identifier('Promise'), identifier('all')),
                [
                  arrayExpression([
                    callExpression(userLoaderId, [contextId]),
                    loadNamespaces,
                  ]),
                ]
              )
            )
          ),
        ]),

        returnStatement(
          objectExpression([
            ...sharedProperties,
            spreadElement(userLoaderResultId),
            objectProperty(
              propsId,
              objectExpression([
                spreadElement(memberExpression(userLoaderResultId, propsId)),
                spreadElement(namespacePropsId),
              ])
            ),
          ])
        ),
      ])
    : blockStatement([
        returnStatement(
          objectExpression([
            ...sharedProperties,
            objectProperty(propsId, awaitExpression(loadNamespaces)),
          ])
        ),
      ])

  return functionDeclaration(
    nextTranslateLoaderId,
    [contextId],
    body,
    false,
    true
  )
}
