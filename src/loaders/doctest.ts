import { readFile } from 'node:fs/promises';
import { parseDoctests } from '../doctest-processing/parseDoctests';
import { transform } from '../doctest-processing/transformer/node-test';

const extensionsRegex = /\.(js|ts|mjs|cjs|mts|cts|jsx|tsx)$/;

export async function load(url: string, context: any, next: any) {
  if (url.includes("node_modules") || !extensionsRegex.test(url))
    return next(url, context)
  const content = (await readFile(new URL(url))).toString()
  const doctests = parseDoctests({ content, path: url })
  const doctestMap = "{\n" + doctests.map(d => {
    return ` ${d.lineNumber}: () => { ${transform(d)} },\n`
  }) + "}"
  const source = `${content}\nconst __doctests__ = ${doctestMap}`
  console.log(source)

  return { ...await next(url, context), source }
}