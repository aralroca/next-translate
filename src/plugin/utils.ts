import ts from 'typescript'
import { ParsedFilePkg, Transformer } from './types'

const specFileOrFolderRgx =
  /(__mocks__|__tests__)|(\.(spec|test)\.(tsx|ts|js|jsx)$)/

export const defaultLoader =
  '(l, n) => import(`@next-translate-root/locales/${l}/${n}`).then(m => m.default)'

export function getDefaultAppJs(hasLoadLocaleFrom: boolean) {
  return `
    import i18nConfig from '@next-translate-root/i18n'
    import appWithI18n from 'next-translate/appWithI18n'
  
    function MyApp({ Component, pageProps }) {
      return <Component {...pageProps} />
    }
  
    export default appWithI18n(MyApp, {
      ...i18nConfig,
      skipInitialProps: true,
      isLoader: true,
      ${overwriteLoadLocales(hasLoadLocaleFrom)}
    })
  `
}

export function overwriteLoadLocales(hasLoadLocaleFrom: boolean) {
  if (hasLoadLocaleFrom) return ''
  return `loadLocaleFrom: ${defaultLoader},`
}

/**
 * @param basePath - Path to the root of the target project
 * @param cutDependencies - Whether to not include imports and the standard library
 * @returns Compiler options
 */
export function getTsCompilerOptions(
  basePath: string,
  cutDependencies = false
): ts.CompilerOptions {
  let options: ts.CompilerOptions

  const configPath = ts.findConfigFile(
    basePath,
    ts.sys.fileExists,
    'tsconfig.json'
  )

  if (!configPath) {
    // Configuration file not found - most likely it is JS
    options = { allowJs: true }
  } else {
    const readConfigFileResult = ts.readConfigFile(configPath, ts.sys.readFile)
    const jsonConfig = readConfigFileResult.config
    const convertResult = ts.convertCompilerOptionsFromJson(
      jsonConfig.compilerOptions,
      basePath
    )

    options = convertResult.options
  }

  if (cutDependencies) {
    // This allows us to ignore all files except those that are added explicitly.
    // Including imports and standard library.
    // This was done in order to speed up file analysis
    options = { ...options, types: [], noResolve: true, noLib: true }
  }

  return options
}

/**
 * @param program - File container [program]{@link ts.Program}
 * @param filename - The name of the file inside the program
 * @returns A file package that allows us to analyze and modify the code inside
 */
export function getFilePkg(program: ts.Program, filename: string) {
  const checker = program.getTypeChecker()
  const sourceFile = program.getSourceFile(filename)!
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  const fileSymbol = checker.getSymbolAtLocation(sourceFile)
  let filePkg: ParsedFilePkg

  function transform(transformer: Transformer) {
    const { sourceFile } = filePkg
    const transformationResult = ts.transform(sourceFile, [
      (context) => (sourceFile) => transformer(sourceFile, context),
    ])
    filePkg.sourceFile = transformationResult.transformed[0]
    filePkg.fileSymbol = checker.getSymbolAtLocation(filePkg.sourceFile)
  }

  function getCode() {
    const { sourceFile } = filePkg
    return printer.printNode(ts.EmitHint.Unspecified, sourceFile, sourceFile)
  }

  filePkg = { program, checker, sourceFile, fileSymbol, transform, getCode }
  return filePkg
}

/**
 * @param basePath - Path to the root of the target project
 * @param filename - Path to JS/TS file
 * @returns File package for further manipulations
 */
export function parseFile(basePath: string, filename: string): ParsedFilePkg {
  const options = getTsCompilerOptions(basePath, true)
  const program = ts.createProgram([filename], options)
  return getFilePkg(program, filename)
}

/**
 * Does the same as "parseFile", but in a fake environment
 * and for code directly (no file on disk, of course)
 *
 * @param format - Pseudo file extension
 * @param code - Contents of the pseudo file
 * @returns File package for further manipulations
 */
export function parseCode(format: string, code: string): ParsedFilePkg {
  const options = getTsCompilerOptions('/', true)
  const host = ts.createCompilerHost(options)
  const filename = `source.${format}`

  host.getSourceFile = (fileName: string) => {
    return ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest)
  }

  const program = ts.createProgram([filename], options, host)
  return getFilePkg(program, filename)
}

/**
 * @param filePkg - File package
 * @param node - The node for which we will get the symbol
 * @returns Entity for more detailed analysis by the compiler
 */
export function getSymbol(filePkg: ParsedFilePkg, node: ts.Node) {
  const location = ts.isVariableDeclaration(node) ? node.name : node
  return filePkg.checker.getSymbolAtLocation(location)
}

/**
 * @param filePkg - File package
 * @param moduleName - The name of the module about which we will receive information
 * @returns If a module with this name was imported, then the map "export name: local name"
 */
export function getImportedNames(filePkg: ParsedFilePkg, moduleName: string) {
  const importClause = filePkg.sourceFile.forEachChild((node) => {
    if (ts.isImportDeclaration(node)) {
      if (node.moduleSpecifier.getText().slice(1, -1) === moduleName) {
        return node.importClause
      }
    }
    return undefined
  })

  if (importClause) {
    const exportedNamesToImported = new Map<string, ts.Identifier>()

    // Default import
    if (importClause.name) {
      exportedNamesToImported.set('default', importClause.name)
    }

    // Named imports
    if (importClause.namedBindings) {
      importClause.namedBindings.forEachChild((node) => {
        if (ts.isImportSpecifier(node)) {
          if (node.propertyName) {
            // Alias is used
            exportedNamesToImported.set(node.propertyName.getText(), node.name)
          } else {
            exportedNamesToImported.set(node.name.getText(), node.name)
          }
        }
      })
    }

    return exportedNamesToImported
  }

  // The requested module was not imported in the file
  return undefined
}

/**
 * @param filePkg - File package
 * @param parenthesizedExpression - Parenthesis expression
 * @returns Content inside parenthesis
 */
export function resolveParenthesis(
  filePkg: ParsedFilePkg,
  parenthesizedExpression: ts.ParenthesizedExpression
): ts.Expression {
  const content = parenthesizedExpression.expression

  if (ts.isParenthesizedExpression(content)) {
    return resolveParenthesis(filePkg, content)
  } else {
    return content
  }
}

/**
 * @param filePkg - File package
 * @param identifier - Identifier whose declaration will be searched for
 * @returns Deepest declaration, or last id found
 */
export function resolveIdentifier(
  filePkg: ParsedFilePkg,
  identifier: ts.Identifier
): ts.Declaration | ts.Identifier {
  const identifierSymbol = getSymbol(filePkg, identifier)

  if (identifierSymbol && Array.isArray(identifierSymbol.declarations)) {
    const identifierDeclaration = identifierSymbol.declarations[0]

    if (ts.isVariableDeclaration(identifierDeclaration)) {
      let initializer = identifierDeclaration.initializer
      if (initializer && ts.isParenthesizedExpression(initializer)) {
        initializer = resolveParenthesis(filePkg, initializer)
      }
      if (initializer && ts.isIdentifier(initializer)) {
        return resolveIdentifier(filePkg, initializer)
      }
    }

    return identifierDeclaration
  }

  // Return the last found identifier if we can't find its definition
  return identifier
}

export function getNamedExport(
  filePkg: ParsedFilePkg,
  name: string,
  resolveExport = true
) {
  const { checker, fileSymbol } = filePkg
  let exportContent: ts.Expression | ts.Declaration | undefined

  if (fileSymbol) {
    const exportSymbol = checker.tryGetMemberInModuleExports(name, fileSymbol)

    if (exportSymbol && Array.isArray(exportSymbol.declarations)) {
      const exportDeclaration = exportSymbol.declarations[0]

      if (resolveExport && ts.isExportAssignment(exportDeclaration)) {
        exportContent = exportDeclaration.expression
        if (ts.isParenthesizedExpression(exportContent)) {
          exportContent = resolveParenthesis(filePkg, exportContent)
        }
        if (ts.isIdentifier(exportContent)) {
          exportContent = resolveIdentifier(filePkg, exportContent)
        }
      } else {
        exportContent = exportDeclaration
      }
    }
  }

  return exportContent
}

// Alias for `getNamedExport('default')`
export function getDefaultExport(filePkg: ParsedFilePkg, resolveExport = true) {
  return getNamedExport(filePkg, 'default', resolveExport)
}

export function hasExportName(filePkg: ParsedFilePkg, name: string) {
  return Boolean(getNamedExport(filePkg, name, false))
}

export function getStaticName(
  filePkg: ParsedFilePkg,
  target: ts.Declaration | ts.Expression,
  name: string
) {
  const symbol = getSymbol(filePkg, target)
  if (symbol) {
    return filePkg.checker.tryGetMemberInModuleExports(name, symbol)
  }

  return undefined
}

export function hasStaticName(
  filePkg: ParsedFilePkg,
  target: ts.Declaration | ts.Expression,
  name: string
) {
  return Boolean(getStaticName(filePkg, target, name))
}

export function isPageToIgnore(pageFilePath: string) {
  const fileName = pageFilePath.substring(pageFilePath.lastIndexOf('/') + 1)
  return (
    pageFilePath.startsWith('/api/') ||
    pageFilePath.startsWith('/_document.') ||
    pageFilePath.startsWith('/middleware.') ||
    fileName.startsWith('_middleware.') ||
    specFileOrFolderRgx.test(pageFilePath)
  )
}

export function hasHOC(filePkg: ParsedFilePkg) {
  let defaultExport = getDefaultExport(filePkg)

  if (
    !defaultExport ||
    hasExportName(filePkg, 'getStaticProps') ||
    hasExportName(filePkg, 'getServerSideProps') ||
    hasExportName(filePkg, 'getStaticPaths')
  ) {
    return false
  }

  if (ts.isVariableDeclaration(defaultExport) && defaultExport.initializer) {
    defaultExport = defaultExport.initializer
    if (ts.isParenthesizedExpression(defaultExport)) {
      defaultExport = resolveParenthesis(filePkg, defaultExport)
    }
    if (ts.isIdentifier(defaultExport)) {
      defaultExport = resolveIdentifier(filePkg, defaultExport)
    }

    // If is exported normally (variable), is not a HOC
    if (!ts.isCallExpression(defaultExport)) {
      return false
    }
  }

  // If is exported normally (function or class), is not a HOC
  if (
    ts.isFunctionDeclaration(defaultExport) ||
    ts.isClassDeclaration(defaultExport)
  ) {
    return false
  }

  const importedNames = getImportedNames(
    filePkg,
    'next-translate/withTranslation'
  )
  const withTranslationId = importedNames?.get('default')

  // If the export is the result of a function call (except withTranslation),
  // is a HOC
  function isCallExpressionWithHOC(callExpression: ts.CallExpression): boolean {
    const callable = callExpression.expression
    const expressionsToVisit = [callable, ...callExpression.arguments]

    // Recursively check the callable part and its arguments
    for (const expression of expressionsToVisit) {
      if (ts.isCallExpression(expression)) {
        return isCallExpressionWithHOC(expression)
      }

      // detect: export default ``HOCed``(...)
      if (ts.isIdentifier(expression)) {
        const resolved = resolveIdentifier(filePkg, expression)

        // detect: const ``HOCed = withHOC(Page)``; export default HOCed(...)
        if (ts.isVariableDeclaration(resolved)) {
          let initializer = resolved.initializer
          if (initializer && ts.isParenthesizedExpression(initializer)) {
            initializer = resolveParenthesis(filePkg, initializer)
          }
          if (initializer && ts.isCallExpression(initializer)) {
            return isCallExpressionWithHOC(initializer)
          }
        }

        // detect: import ``withHOC`` from '...'
        if (ts.isImportClause(resolved)) {
          if (resolved.name?.getText() !== withTranslationId?.getText()) {
            return true
          }
        }
      }
    }

    return false
  }

  if (ts.isCallExpression(defaultExport)) {
    if (withTranslationId) {
      return isCallExpressionWithHOC(defaultExport)
    } else {
      return true
    }
  }

  return false
}

export function isNotExportModifier(modifier: ts.Modifier) {
  const exportModifiers: ts.SyntaxKind[] = [
    ts.SyntaxKind.DefaultKeyword,
    ts.SyntaxKind.ExportKeyword,
  ]
  return !exportModifiers.includes(modifier.kind)
}

/**
 * Removes the export modifiers from the entity and also
 * makes it available locally by the given name
 *
 * @param filePkg - File package
 * @param exportName - The name under which the entity was exported from the file
 * @param defaultLocalName - The name that will be applied if the entity *does not* have its own
 * @returns The name by which the entity can now be retrieved. Empty string if entity not found
 */
export function interceptExport(
  filePkg: ParsedFilePkg,
  exportName: string,
  defaultLocalName: string
) {
  const exportContent = getNamedExport(filePkg, exportName, false)

  // If the entity is already available by some name inside the module,
  // then we use it to avoid problems due to renames
  let finalLocalName = ''

  // Extra import statement if we need to redirect `export { ... } from '...'`
  let extraImport: ts.ImportDeclaration | undefined

  // We do nothing and return an empty string if there is no such export name
  if (!exportContent) return finalLocalName

  filePkg.transform((sourceFile, context) => {
    function visitor(node: ts.Node): ts.Node {
      // `export class A`
      if (ts.isClassDeclaration(node) && node === exportContent) {
        if (node.name) finalLocalName = node.name.getText()

        // Turning the class export into a regular declaration
        return ts.factory.updateClassDeclaration(
          node,
          node.decorators,
          node.modifiers?.filter(isNotExportModifier),
          node.name ?? ts.factory.createIdentifier(defaultLocalName),
          node.typeParameters,
          node.heritageClauses,
          node.members
        )
      }

      // `export function fun123`
      if (ts.isFunctionDeclaration(node) && node === exportContent) {
        if (node.name) finalLocalName = node.name.getText()

        // Turning the function export into a regular declaration
        return ts.factory.updateFunctionDeclaration(
          node,
          node.decorators,
          node.modifiers?.filter(isNotExportModifier),
          node.asteriskToken,
          node.name ?? ts.factory.createIdentifier(defaultLocalName),
          node.typeParameters,
          node.parameters,
          node.type,
          node.body
        )
      }

      // `export const a = 1, b = 2`
      if (
        ts.isVariableStatement(node) &&
        ts.isVariableDeclaration(exportContent!) &&
        node.declarationList.declarations.includes(exportContent)
      ) {
        finalLocalName = exportContent.name.getText()

        // `export const a = 1` -> `const a = 1`
        return ts.factory.updateVariableStatement(
          node,
          node.modifiers?.filter(isNotExportModifier),
          node.declarationList
        )
      }

      // `export { ... } [from '...']`
      if (
        ts.isExportDeclaration(node) &&
        ts.isExportSpecifier(exportContent!) &&
        node.exportClause &&
        ts.isNamedExports(node.exportClause)
      ) {
        // List of names exported from the module, except for the target
        const filteredSpecifiers = node.exportClause.elements.filter(
          (specifier) => specifier !== exportContent
        )

        if (node.moduleSpecifier) {
          // `export { ... } from '...'`
          finalLocalName = defaultLocalName
          extraImport = ts.factory.createImportDeclaration(
            undefined,
            undefined,
            ts.factory.createImportClause(
              node.isTypeOnly,
              undefined,
              ts.factory.createNamedImports([
                ts.factory.createImportSpecifier(
                  exportContent.isTypeOnly,
                  exportContent.propertyName ?? exportContent.name,
                  ts.factory.createIdentifier(defaultLocalName)
                ),
              ])
            ),
            node.moduleSpecifier
          )
        } else {
          // `export { ... }`
          const localId = exportContent.propertyName ?? exportContent.name
          finalLocalName = localId.getText()
        }

        // Remove target export specifier
        return ts.factory.updateExportDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.isTypeOnly,
          ts.factory.updateNamedExports(node.exportClause, filteredSpecifiers),
          node.moduleSpecifier,
          node.assertClause
        )
      }

      // `export default 123`
      if (ts.isExportAssignment(node) && node === exportContent) {
        finalLocalName = defaultLocalName

        // If the exported expression can be placed in a variable, then we do so.
        // const {finalLocalName} = {exportContent}
        return ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                defaultLocalName,
                undefined,
                undefined,
                node.expression
              ),
            ],
            ts.NodeFlags.Const
          )
        )
      }

      return ts.visitEachChild(node, visitor, context)
    }
    return ts.visitNode(sourceFile, visitor)
  })

  if (extraImport) {
    filePkg.transform((sourceFile) => {
      return ts.factory.updateSourceFile(sourceFile, [
        extraImport!,
        ...sourceFile.statements,
      ])
    })
  }

  return finalLocalName
}
