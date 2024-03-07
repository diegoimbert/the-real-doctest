// Copyright (c) 2024 Diego Imbert
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { run, subcommands } from "cmd-ts"
import { installCommand } from "./commands/install"
import { version } from "../../../package.json"

export default function main() {
  run(
    subcommands({
      name: "The Real Doctest",
      version,
      cmds: {
        install: installCommand
      }
    }),
    process.argv.slice(2)
  )
}
