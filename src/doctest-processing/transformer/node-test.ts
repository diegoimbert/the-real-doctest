import { Doctest } from "../parseDoctests"
import * as ts from "typescript"

export function transform(doctest: Doctest): string {
  const originalAst = ts.createSourceFile("", doctest.content, ts.ScriptTarget.ESNext, true)
  const newAst = ts.transform(originalAst, [transformer]).transformed[0]
  const printer = ts.createPrinter({removeComments: true, newLine: ts.NewLineKind.LineFeed});
  return printer
    .printNode(ts.EmitHint.Unspecified, newAst, newAst.getSourceFile())
    .replace(/\n/g, "")
}

const transformer: ts.TransformerFactory<ts.Node> = (context) => {
  return sourceFile => {
    const visitor = (node: ts.Node): ts.Node => {
      if (node.kind == ts.SyntaxKind.BinaryExpression && node.parent.kind == ts.SyntaxKind.ExpressionStatement) {
        // SAFETY: Didn't find another way to check the specific kind of binary operator
        const expr = node as ts.BinaryExpression;
        const exprTransform = exprTransformMap[expr.operatorToken.kind]
        if (exprTransform) {
          const assertFn = ts.factory.createIdentifier(exprTransform.identifier)
          return ts.factory.createCallExpression(assertFn, undefined, [
            expr.left,
            expr.right
          ])
        }
      }
      return ts.visitEachChild(node, visitor, context)
    }
    return ts.visitNode(sourceFile, visitor)
  }
}

const exprTransformMap: ExprTransformMap = {
  [ts.SyntaxKind.EqualsEqualsToken]: { identifier: "assert.equal" },
  [ts.SyntaxKind.EqualsEqualsEqualsToken]: { identifier: "assert.strictEqual" },
}
type ExprTransformMap = Record<ts.SyntaxKind | number, { identifier: string }>
