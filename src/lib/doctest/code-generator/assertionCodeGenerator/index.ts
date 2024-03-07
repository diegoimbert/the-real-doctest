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
    return doctests
      .map(doctest => {
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
      .join("\n")
  }
}

/**
 * Transforms a doctest into source code using the node:test functions
 * == and === become respectively assert.equal and assert.strictEqual
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
          //   require("node:assert").strictEqual(left, right)
          const requireIdentifier = ts.factory.createIdentifier("require")
          const nodeAssertStrIdentifier = ts.factory.createStringLiteral("node:assert")
          const assertModule = ts.factory.createCallExpression(
            requireIdentifier,
            undefined,
            [nodeAssertStrIdentifier]
          )
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
  [ts.SyntaxKind.EqualsEqualsToken]: { identifier: "equal" },
  [ts.SyntaxKind.EqualsEqualsEqualsToken]: { identifier: "strictEqual" },
  [ts.SyntaxKind.ExclamationEqualsToken]: { identifier: "notEqual" },
  [ts.SyntaxKind.ExclamationEqualsEqualsToken]: { identifier: "notStrictEqual" }
}
type ExprTransformMap = Record<ts.SyntaxKind | number, { identifier: string }>
