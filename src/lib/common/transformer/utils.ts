import type * as ts from "typescript"

export function getPatchedHost(
  maybeHost: ts.CompilerHost | undefined,
  tsInstance: typeof ts,
  compilerOptions: ts.CompilerOptions
): ts.CompilerHost & { fileCache: Map<string, ts.SourceFile> } {
  const fileCache = new Map()
  const compilerHost = maybeHost ?? tsInstance.createCompilerHost(compilerOptions, true)
  const originalGetSourceFile = compilerHost.getSourceFile

  return Object.assign(compilerHost, {
    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget) {
      fileName = normalizePath(fileName)
      if (fileCache.has(fileName)) return fileCache.get(fileName)

      const sourceFile = originalGetSourceFile.apply(void 0, Array.from(arguments) as any)
      fileCache.set(fileName, sourceFile)

      return sourceFile
    },
    fileCache
  })
}

export function normalizePath(path: string) {
  return path
}

// For some reason, the getText methods can't read the text field, but we can
export function patchedGetText<T extends { getText(): string } | undefined | null>(
  obj: T
): string {
  if (!obj) return ""
  try {
    return obj.getText()
  } catch (e) {
    const text = (obj as any)?.text
    if (typeof text === "string") return text
    throw e
  }
}
