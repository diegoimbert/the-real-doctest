// Copyright (c) 2024 Diego Imbert
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Doctest } from "./parser"

export function removeDoctestsFromSourceFile({
  sourceString,
  doctests
}: {
  sourceString: string
  doctests: Doctest[]
}): string {
  return sourceString
    .split("\n")
    .filter((x, i) => !doctests.map(d => d.lineNumber).includes(i))
    .join("\n")
}
