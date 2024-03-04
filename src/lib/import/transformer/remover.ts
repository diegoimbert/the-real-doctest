/**
 * This transformer replaces all non source code imports (.jpg, .css, ...)
 * with an empty object.
 * This is to prevent invalid file type errors
 */

import type * as ts from "typescript"
import type { ProgramTransformerExtras, PluginConfig } from "ts-patch"
import {
  getPatchedHost,
  normalizePath,
  patchedGetText
} from "../../common/transformer/utils"

const extensionsRegex = /\.(html|css|scss|sass|png|webp|jpg|svg)$/

export default function transformProgram(
  program: ts.Program,
  host: ts.CompilerHost | undefined,
  options: PluginConfig,
  { ts: tsInstance }: ProgramTransformerExtras
): ts.Program {
  const compilerOptions = program.getCompilerOptions()
  const compilerHost = getPatchedHost(host, tsInstance, compilerOptions)
  const rootFileNames = program.getRootFileNames().map(normalizePath)

  /* Transform AST */
  const transformedSource = tsInstance.transform(
    /* sourceFiles */ program
      .getSourceFiles()
      .filter(sourceFile => rootFileNames.includes(sourceFile.fileName)),
    /* transformers */ [transformAst.bind(tsInstance)],
    compilerOptions
  ).transformed

  /* Render modified files and create new SourceFiles for them to use in host's cache */
  const { printFile } = tsInstance.createPrinter()
  for (const sourceFile of transformedSource) {
    const { fileName, languageVersion } = sourceFile
    const updatedSourceFile = tsInstance.createSourceFile(
      fileName,
      printFile(sourceFile),
      languageVersion
    )
    compilerHost.fileCache.set(fileName, updatedSourceFile)
  }

  /* Re-create Program instance */
  return tsInstance.createProgram(rootFileNames, compilerOptions, compilerHost)
}

function transformAst(this: typeof ts, context: ts.TransformationContext) {
  const tsInstance = this

  /* Transformer Function */
  return (sourceFile: ts.SourceFile) => {
    return tsInstance.visitEachChild(sourceFile, visit, context)

    /* Visitor Function */
    function visit(node: ts.Node): ts.Node {
      if (tsInstance.isImportDeclaration(node)) {
        const name = patchedGetText(node.importClause?.name)
        const path = patchedGetText(node.moduleSpecifier).slice(1, -1)
        if (name && extensionsRegex.test(path)) {
          return emptyVariableAsAny(context, tsInstance, name)
        }
      }
      return tsInstance.visitEachChild(node, visit, context)
    }
  }
}

function emptyVariableAsAny(
  context: ts.TransformationContext,
  tsInstance: typeof ts,
  name: string
) {
  return context.factory.createVariableStatement(
    [],
    context.factory.createVariableDeclarationList([
      context.factory.createVariableDeclaration(
        name,
        undefined,
        undefined,
        context.factory.createAsExpression(
          context.factory.createNull(),
          context.factory.createKeywordTypeNode(tsInstance.SyntaxKind.AnyKeyword)
        )
      )
    ])
  )
}
