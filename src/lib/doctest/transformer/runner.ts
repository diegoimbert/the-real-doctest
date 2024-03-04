/**
 * This transformer turns doctests in comments into actual code
 */

import type * as ts from "typescript"
import type { ProgramTransformerExtras, PluginConfig } from "ts-patch"
import { getPatchedHost, normalizePath } from "../../common/transformer/utils"
import { parseDoctests } from "../parser"
import { DoctestCodeGenerator } from "../code-generator"
import { assertionCodeGenerator } from "../code-generator/assertionCodeGenerator"
import { removeDoctestsFromSourceFile } from "../removeDoctestsFromSourceFile"

const doctestCodeGenerator: DoctestCodeGenerator = assertionCodeGenerator

export default function transformProgram(
  program: ts.Program,
  host: ts.CompilerHost | undefined,
  options: PluginConfig,
  { ts: tsInstance }: ProgramTransformerExtras
): ts.Program {
  const compilerOptions = program.getCompilerOptions()
  const compilerHost = getPatchedHost(host, tsInstance, compilerOptions)
  const rootFileNames = program.getRootFileNames()

  /* Render modified files and create new SourceFiles for them to use in host's cache */
  const { printFile } = tsInstance.createPrinter()

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.fileName.includes("node_modules")) {
      continue
    }
    const { fileName, languageVersion } = sourceFile
    if (fileName.includes("node_modules")) continue
    const sourceString = printFile(sourceFile)

    const doctests = parseDoctests({
      content: sourceString,
      path: fileName
    })
    if (!doctests.length) continue

    const newSourceString =
      removeDoctestsFromSourceFile({ sourceString, doctests }) +
      "\n" +
      doctestCodeGenerator.generate({ doctests })

    console.log("SOURCE --------------------")
    console.log("SOURCE --------------------")
    console.log("SOURCE --------------------")
    console.log("SOURCE --------------------")
    console.log(newSourceString)

    const updatedSourceFile = tsInstance.createSourceFile(
      fileName,
      newSourceString,
      languageVersion
    )
    compilerHost.fileCache.set(fileName, updatedSourceFile)
  }

  /* Re-create Program instance */
  return tsInstance.createProgram(rootFileNames, compilerOptions, compilerHost)
}
