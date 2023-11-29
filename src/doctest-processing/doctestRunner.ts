type DoctestIdentifier = string
type ExceptionIdentifier = string

const d: DoctestIdentifier = "d"
const e: ExceptionIdentifier = "e"

export const DOCTEST_RESULT_LOG_ID = "DOCTEST_RESULT >>";

export function runAllTests(path: string) {
  return `{if (process.argv.includes('${path}')) {__doctests__.forEach(${d} => ${runDoctest})}}`
}

const logJson = (json: string) => `console.log("${DOCTEST_RESULT_LOG_ID}", ${json});`
const okMsg = `{status: 'ok', line: ${d}.line}`
const errMsg = `{status: 'err', line: ${d}.line, msg: ${e}.message}`

const runDoctest =
  `{ try { ${d}.f();${logJson(okMsg)}; } catch(${e}) { ${logJson(errMsg)} } }`