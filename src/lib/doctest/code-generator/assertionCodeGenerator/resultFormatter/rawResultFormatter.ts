// Copyright (c) 2024 Diego Imbert
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ResultFormatter, Result } from "."

export type RawResult = {
  path: `${string}:${number}`
} & Result

export const rawResultFormatter: ResultFormatter = ({ doctest, result }) => {
  return JSON.stringify({
    path: `${doctest.path}:${doctest.lineNumber + 1}`,
    ...result
  } satisfies RawResult)
}
