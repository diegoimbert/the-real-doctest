import { readFile } from 'node:fs/promises';
import { parseDoctests } from '../doctest-processing/parseDoctests';
import { transformDoctests } from '../doctest-processing/transformDoctests';

const extensionsRegex = /\.(js|ts|mjs|cjs|mts|cts|jsx|tsx)$/;

export async function load(url: string, context: any, next: any) {
  if (url.includes("node_modules") || !extensionsRegex.test(url))
    return next(url, context)
  const content = (await readFile(new URL(url))).toString()
  const doctests = parseDoctests({ content, path: url })
  const source = transformDoctests({
    src: { content, path: url },
    doctests
  })
  return { ...await next(url, context), source }
}