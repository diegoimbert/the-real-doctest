import { readFile } from 'node:fs/promises';
import { parseDoctests } from '../doctest-processing/parseDoctests';
import { transform } from '../doctest-processing/transformer/node-test';
import { runAllTests } from '../doctest-processing/doctestRunner';

const extensionsRegex = /\.(js|ts|mjs|cjs|mts|cts|jsx|tsx)$/;

export async function load(url: string, context: any, next: any) {
  const path = new URL(url).pathname
  if (path.includes("node_modules") || !extensionsRegex.test(path))
    return next(url, context)
  const content = (await readFile(path)).toString()
  const doctests = parseDoctests({ content, path })
  const doctestMap = "[\n" + doctests.map(d => 
    `{ f: () => { ${transform(d)} }, line: ${d.lineNumber} },\n`
  ) + "]"
  const source = `${content}\n` +
    `import assert from 'node:assert';\n` +
    `const __doctests__ = ${doctestMap};\n` +
    `${runAllTests(path)};\n`

  return { ...await next(url, context), source }
}