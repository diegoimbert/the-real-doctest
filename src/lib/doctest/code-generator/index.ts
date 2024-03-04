// Copyright (c) 2024 Diego Imbert
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Doctest } from "../parser"

export interface DoctestCodeGenerator {
  // Takes doctests and returns runnable source code that runs the tests
  generate(args: { doctests: Doctest[] }): string
}
