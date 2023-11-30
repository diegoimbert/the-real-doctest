import { DOCTEST_RESULT_LOG_ID, DoctestResult } from "./sourceComponents/doctestRunner"

export const doctestOutputFormat = ["raw", "cli"] as const
export type DoctestOutputFormat = typeof doctestOutputFormat[number]

export type DoctestFormatter = (resultList: DoctestResult[]) => string

export function getFormatter(type: DoctestOutputFormat): DoctestFormatter {
  if (type == "raw") return (d) => DOCTEST_RESULT_LOG_ID + JSON.stringify(d)
  return cliFormatter
}

const cliFormatter: DoctestFormatter = (resultList) => {
  const passed = resultList.filter(r => r.status == "ok").length
  const failed = resultList.filter(r => r.status == "err").length
  let output = []
  if (passed) output.push(`Passed tests: ${passed}`)
  if (failed) {
    output.push(`FAILED TESTS: ${failed}`)
    for (const d of resultList) {
      if (d.status !== "err") continue
      output.push('-----------------')
      output.push(`Error at line ${d.line}: `)
      output.push(d.msg)
    }
  }
  return output.join('\n')
}