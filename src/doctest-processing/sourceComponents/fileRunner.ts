import { Doctest, parseDoctests } from "../parseDoctests"
import { transform } from "../transformer/node-test"
import { runAllTests } from "./doctestRunner"

export function transformFileWithDoctests({ path, content }: {
  path: string, content: string
}): string {
  const doctests = parseDoctests({ content, path })
  const doctestMap = createDoctestMap(doctests)
  const contentWithDoctests = appendDoctests({ path, content, doctestMap })
  return contentWithDoctests
}

function createDoctestMap(doctests: Doctest[]): string {
  return "[\n" + doctests.map(d => 
    `{ f: () => { ${transform(d)} }, line: ${d.lineNumber} },\n`
  ) + "]"
}

function appendDoctests({ path, content, doctestMap }: {
  path: string, content: string, doctestMap: string
}): string {
  return `${content}\n` +
    `import assert from 'node:assert';\n` +
    `const __doctests__ = ${doctestMap};\n` +
    `${runAllTests(path)};\n`
}