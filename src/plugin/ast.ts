import {
  Identifier,
  isExportNamedDeclaration,
  isFunctionDeclaration,
  isVariableDeclaration,
  variableDeclaration,
  exportNamedDeclaration,
  isExportSpecifier,
  StringLiteral,
  Statement,
  FunctionDeclaration,
  VariableDeclaration,
  ExportSpecifier,
  ExportDefaultSpecifier,
  ExportNamespaceSpecifier,
  isImportDeclaration,
  isImportDefaultSpecifier,
  isImportSpecifier,
  isStringLiteral,
} from '@babel/types'

// removes a named export and returns its local identifier
export function removeNamedExport(
  body: Statement[],
  exportId: Identifier
): Identifier | null {
  return getNamedExport(body, exportId, (args, index) => {
    if ('functionDeclaration' in args) {
      body[index] = args.functionDeclaration
      return
    }

    if ('variableDeclaration' in args) {
      const {
        variableDeclaration: { declarations },
        declarationIndex,
      } = args
      const declaration = declarations[declarationIndex]

      // add the local declaration to the program
      body.splice(index + 1, 0, variableDeclaration('const', [declaration]))

      // remove declaration, following declarations need to be made after the the new local declaration as they could depend on it
      const [, ...remainingDeclarations] = declarations.splice(
        declarationIndex,
        declarations.length - declarationIndex
      )
      if (remainingDeclarations.length > 0) {
        body.splice(
          index + 2,
          0,
          exportNamedDeclaration(
            variableDeclaration('const', remainingDeclarations)
          )
        )
      }

      if (declarations.length === 0) {
        body.splice(index, 1)
      }

      return
    }

    if ('specifiers' in args) {
      const { specifiers, specifierIndex } = args

      if (specifiers.length > 1) {
        specifiers.splice(specifierIndex, 1)
      } else {
        body.splice(index, 1)
      }

      return
    }
  })
}

type NamedExportMorph = (
  params:
    | {
      functionDeclaration: FunctionDeclaration & { id: Identifier }
    }
    | {
      variableDeclaration: VariableDeclaration
      declarationIndex: number
    }
    | {
      specifiers: (
        | ExportSpecifier
        | ExportDefaultSpecifier
        | ExportNamespaceSpecifier
      )[]
      specifierIndex: number
    },
  index: number
) => void

export function getNamedExport(
  body: Statement[],
  exportId: Identifier,
  morph?: NamedExportMorph
): Identifier | null {
  for (const index in body) {
    const statement = body[index]
    if (!isExportNamedDeclaration(statement)) {
      continue
    }

    if (statement.declaration) {
      if (
        isFunctionDeclaration(statement.declaration) &&
        statement.declaration.id &&
        idsEqual(statement.declaration.id, exportId)
      ) {
        if (morph)
          morph(
            {
              functionDeclaration:
                statement.declaration as typeof statement.declaration & {
                  id: Identifier
                },
            },
            +index
          )

        return statement.declaration.id
      }

      if (isVariableDeclaration(statement.declaration)) {
        const { declarations } = statement.declaration
        for (const declarationIndex in declarations) {
          const declaration = declarations[declarationIndex]

          const { id } = declaration
          if (id.type !== 'Identifier') {
            continue
          }

          if (idsEqual(id, exportId)) {
            if (morph)
              morph(
                {
                  variableDeclaration: statement.declaration,
                  declarationIndex: +declarationIndex,
                },
                +index
              )

            return id
          }
        }
      }
    }

    for (const specifierIndex in statement.specifiers) {
      const specifier = statement.specifiers[specifierIndex]
      if (
        isExportSpecifier(specifier) &&
        idsEqual(specifier.exported, exportId)
      ) {
        if (morph)
          morph(
            {
              specifiers: statement.specifiers,
              specifierIndex: +specifierIndex,
            },
            +index
          )

        return specifier.local
      }
    }
  }

  return null
}

type Id = Identifier | StringLiteral | undefined | null
function idsEqual(a: Id, b: Id) {
  if (!a || !b) {
    return false
  }

  return getName(a) === getName(b)
}

function getName(id: Identifier | StringLiteral) {
  return id.type === 'StringLiteral' ? id.value : id.name
}
