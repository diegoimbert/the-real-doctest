import { Doctest } from "./parseDoctests"
import * as ts from "typescript"

export interface TransformDoctestsParams {
  src: {
    path: string
    content: string
  }
  doctests: Doctest[]
}

export function transformDoctests({ src: { content, path }, doctests }: TransformDoctestsParams): string {
  let testSources = doctests.map(e => {
    const originalAst = ts.createSourceFile("doctest.ts", e.content, ts.ScriptTarget.ESNext, true)
    const newAst = ts.transform(originalAst, [transformer]).transformed[0]
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const newSource = printer.printNode(ts.EmitHint.Unspecified, newAst, newAst.getSourceFile())

    const { ok, err } = buildTestResultsInJSON({ filePath: path, lineNumber: e.lineNumber })

    return `
    try {
      ${newSource}
      console.log("DOCTEST_OUTPUT " + JSON.stringify(${ok}))
    } catch (e: any) {
      console.log("DOCTEST_OUTPUT " + JSON.stringify({ ...${err}, msg: e.message }))
    }`
  })
  return [
    content.toString(),
    "import * as assert from 'node:assert'",
    ...testSources,
  ].join("\n")
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

type TestCommonInfo = {
  filePath: string
  lineNumber: number
}
type TestErrorInfo = {
  msg: string
}
export type TestResult = TestCommonInfo & (
  { status: 'ok' } | ({ status: 'err' } & TestErrorInfo)
)

export function buildTestResultsInJSON(info: TestCommonInfo) {
  return {
    ok: JSON.stringify({
      status: 'ok',
      ...info,
    } satisfies TestResult),
    err: JSON.stringify({
      status: 'err',
      ...info,
      msg: "replace error msg",
    } satisfies TestResult),
  }
}