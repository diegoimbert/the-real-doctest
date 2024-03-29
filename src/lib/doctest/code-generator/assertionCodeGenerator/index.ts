// Copyright (c) 2024 Diego Imbert
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import ts from "typescript"
import { DoctestCodeGenerator } from ".."
import { Doctest } from "../../parser"
import { rawResultFormatter as resultFormatter } from "./resultFormatter/rawResultFormatter"

export const outputPrefix = "DOCTEST >> "

export const assertionCodeGenerator: DoctestCodeGenerator = {
  generate({ doctests }) {
    const importStmt = "import __nodeAssert__ from 'node:assert'"
    const doctestsCode = doctests.map(doctest => {
      return `try { ${transform(
        doctest
      )}; console.log('${outputPrefix}' + JSON.stringify(${resultFormatter({
        doctest,
        result: { type: "success" }
      })})) } catch (e: any) { console.log('${outputPrefix}' + JSON.stringify({...${resultFormatter(
        {
          doctest,
          result: { type: "error", message: "?" }
        }
      )}, message: e.message })) }`
    })
    return [importStmt, ...doctestsCode].join("\n")
  }
}

/**
 * Transforms a doctest into source code using the node:assert functions
 * == and === become respectively assert.deepEqual and assert.deepStrictEqual
 *
 * @param doctest The doctest to transform
 * @returns Source code for this doctest
 */
export function transform(doctest: Doctest): string {
  const originalAst = ts.createSourceFile(
    "",
    doctest.content,
    ts.ScriptTarget.ESNext,
    true
  )
  const newAst = ts.transform(originalAst, [transformer]).transformed[0]
  const printer = ts.createPrinter({
    removeComments: true,
    newLine: ts.NewLineKind.LineFeed
  })
  return printer
    .printNode(ts.EmitHint.Unspecified, newAst, newAst.getSourceFile())
    .replace(/\n/g, "")
}

const transformer: ts.TransformerFactory<ts.Node> = context => {
  return sourceFile => {
    const visitor = (node: ts.Node): ts.Node => {
      if (ts.isBinaryExpression(node) && ts.isExpressionStatement(node.parent)) {
        const exprTransform = exprTransformMap[node.operatorToken.kind]
        if (exprTransform) {
          // We are writing in AST (e.g):
          //   __nodeAssert__.strictEqual(left, right)
          const assertModule = ts.factory.createIdentifier("__nodeAssert__")
          const assertFn = ts.factory.createPropertyAccessExpression(
            assertModule,
            exprTransform.identifier
          )
          return ts.factory.createCallExpression(assertFn, undefined, [
            node.left,
            node.right
          ])
        }
      }
      return ts.visitEachChild(node, visitor, context)
    }
    return ts.visitNode(sourceFile, visitor)
  }
}

const exprTransformMap: ExprTransformMap = {
  [ts.SyntaxKind.EqualsEqualsToken]: { identifier: "deepEqual" },
  [ts.SyntaxKind.EqualsEqualsEqualsToken]: { identifier: "deepStrictEqual" },
  [ts.SyntaxKind.ExclamationEqualsToken]: { identifier: "notDeepEqual" },
  [ts.SyntaxKind.ExclamationEqualsEqualsToken]: { identifier: "notDeepStrictEqual" }
}
type ExprTransformMap = Record<ts.SyntaxKind | number, { identifier: string }>
