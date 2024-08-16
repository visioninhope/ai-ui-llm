import * as uiComponents from '@/components/ui'
import { NodePath } from '@babel/core'
import * as Babel from '@babel/standalone'
import * as t from '@babel/types'
import { type ClassValue, clsx } from 'clsx'
import * as framerMotion from 'framer-motion'
import * as lucide from 'lucide-react'
import * as React from 'react'
import * as recharts from 'recharts'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getReactComponentFromCode = (code: string) => {
  const transformedCode = transformCode(code)
  console.log('transformedCode', transformedCode)

  const factoryFunction = new Function(transformedCode)()
  const component = factoryFunction(React, recharts, uiComponents, lucide, framerMotion)

  return component
}

const transformCode = (code: string) => {
  const { modifiedInput: codeWithoutExports, exportedName: componentName } = removeDefaultExport(code)

  const transpiledCode = Babel.transform(codeWithoutExports, {
    presets: ['react'],
    plugins: [importTransformerPlugin]
  }).code

  return `
return function(React, recharts, uiComponents, lucide, framerMotion) {
  ${transpiledCode}
  return ${componentName};
}
  `
}

export const importTransformerPlugin = () => ({
  name: 'import-transformer',
  visitor: {
    ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
      const source = path.node.source.value
      const specifiers = path.node.specifiers

      if (specifiers.length === 0) return

      let objectName: string
      if (source === 'react') {
        objectName = 'React'
      } else if (source.startsWith('@/components/ui')) {
        objectName = 'uiComponents'
      } else if (source === 'lucide-react') {
        objectName = 'lucide'
      } else if (source === 'framer-motion') {
        objectName = 'framerMotion'
      } else {
        objectName = source
      }

      const properties = specifiers
        .map(specifier => {
          if (t.isImportSpecifier(specifier)) {
            const imported = specifier.imported
            const importedName = t.isIdentifier(imported)
              ? imported.name
              : t.isStringLiteral(imported)
                ? imported.value
                : null

            if (importedName === null) {
              console.warn('Unexpected import specifier type')
              return null
            }

            return t.objectProperty(
              t.identifier(importedName),
              t.identifier(specifier.local.name),
              false,
              importedName === specifier.local.name
            )
          }
          return null
        })
        .filter((prop): prop is t.ObjectProperty => prop !== null)

      const newDeclaration = t.variableDeclaration('const', [
        t.variableDeclarator(t.objectPattern(properties), t.identifier(objectName))
      ])

      path.replaceWith(newDeclaration)
    }
  }
})

export const removeDefaultExport = (
  input: string
): {
  modifiedInput: string
  exportedName: string | null
} => {
  const defaultExportWithDeclarationRegex = /export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*{[^}]*}/
  const defaultExportRegex = /export\s+default\s+([A-Za-z0-9_]+);?/

  let match = input.match(defaultExportWithDeclarationRegex)
  let exportedName: string | null = null
  let modifiedInput = input

  if (match) {
    exportedName = match[1]
    modifiedInput = modifiedInput.replace(/export\s+default\s+function/, 'function').trim()
  } else {
    match = input.match(defaultExportRegex)
    if (match) {
      exportedName = match[1]
      modifiedInput = modifiedInput.replace(defaultExportRegex, '').trim()
    }
  }

  return { modifiedInput, exportedName }
}
