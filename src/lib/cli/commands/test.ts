// Copyright (c) 2024 Diego Imbert
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { command, positional } from "cmd-ts"
import { withLib } from "../withLib"
import { exec } from "node:child_process"
import fs from "fs/promises"
import { File } from "cmd-ts/batteries/fs"
import cliSelect from "cli-select"
import { installCommand } from "./install"
import { outputPrefix } from "../../doctest/code-generator/assertionCodeGenerator"
import { RawResult } from "../../doctest/code-generator/assertionCodeGenerator/resultFormatter/rawResultFormatter"

export const testCommand = command({
  name: "Test",
  description: "Runs a module's doctests",
  args: {
    file: positional(File)
  },
  handler: async args => {
    withLib({
      forceCopy: true,
      handler: async ({ rootPath }) => {
        await new Promise(async (resolve, reject) => {
          const packageJson = JSON.parse(await fs.readFile("./package.json", "utf8"))
          const runCmd = packageJson?.["the-real-doctest"]?.["runCommand"]
          if (!runCmd || typeof runCmd != "string") {
            console.log(
              "Could not find run command in package.json. Do you want to run 'npx the-real-doctest install'?"
            )
            const { value: shouldRunInstall } = await cliSelect({
              values: ["Yes", "No"] as const,
              indentation: 2
            })
            if (shouldRunInstall !== "Yes") {
              return
            }
            await installCommand.handler({})
          }
          const cmd = `${runCmd} ${args.file}`
          exec(cmd, (error, stdout, stderr) => {
            const testResults = stdout
              .split("\n")
              .filter(l => l.startsWith(outputPrefix))
              .map(l => l.substring(outputPrefix.length))
              .map(l => JSON.parse(l) as RawResult)
            const succeeded = testResults.filter(test => test.type == "success")
            const failed = testResults.filter(test => test.type == "error")
            if (succeeded.length) {
              console.log(`${succeeded.length} doctests succeeded`)
            }
            if (failed.length) {
              console.log(`${failed.length} doctests failed`)
              failed.forEach(test => {
                if (test.type !== "error") return // Type narrowing doesn't work on that yet?
                console.log(`At ${test.path}`)
                console.log(` >> ${test.message}`)
              })
            }
            resolve(null)
          })
        })
      }
    })
  }
})
