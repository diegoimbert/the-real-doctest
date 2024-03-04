// Copyright (c) 2024 Diego Imbert
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Doctest } from "../../../parser"

// Returns a JSON-format entity
export type ResultFormatter = (args: { result: Result; doctest: Doctest }) => string

export type Result = { type: "error"; message: string } | { type: "success" }
