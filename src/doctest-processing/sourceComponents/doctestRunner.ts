type DoctestIdentifier = string
type ExceptionIdentifier = string

const d: DoctestIdentifier = "d"
const e: ExceptionIdentifier = "e"

export const DOCTEST_RESULT_LOG_ID = "DOCTEST_RESULT >> ";

const logJson = (json: string) => `console.log("${DOCTEST_RESULT_LOG_ID}" + JSON.stringify(${json}));`

const okMsg = `{status: 'ok', line: ${d}.line}`
const errMsg = `{status: 'err', line: ${d}.line, msg: ${e}.message}`

const runDoctest =
  `{ try { ${d}.f();${logJson(okMsg)}; } catch(${e}) { ${logJson(errMsg)} } }`

export const runAllTests = `{__doctests__.forEach(${d} => ${runDoctest})}`

export type DoctestResult = { line: number } & (
  | { status: 'err', msg: string }
  | { status: 'ok' }
)
