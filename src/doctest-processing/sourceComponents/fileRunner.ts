import { Doctest, parseDoctests } from "../parseDoctests"
import { transform } from "../transformer/node-test"
import { runAllTests } from "./doctestRunner"

export function transformFileWithDoctests({ path, content, filter }: {
  path: string, content: string, filter?: (d: Doctest) => boolean
}): string {
  let doctests = parseDoctests({ content, path })
  if (filter) doctests = doctests.filter(filter)
  const doctestMap = createDoctestMap(doctests)
  const contentWithDoctests = appendDoctests({ content, doctestMap })
  return contentWithDoctests
}

function createDoctestMap(doctests: Doctest[]): string {
  return "[\n" + doctests.map(d => 
    `{ f: () => { ${transform(d)} }, line: ${d.lineNumber} },\n`
  ) + "]"
}

function appendDoctests({ content, doctestMap }: {
  content: string, doctestMap: string
}): string {
  return `${content}\n` +
    `import * as assert from 'node:assert';\n` +
    `const __doctests__ = ${doctestMap};\n` +
    `${runAllTests};\n`
}