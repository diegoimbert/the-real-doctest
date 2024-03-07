// Copyright (c) 2024 Diego Imbert
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { command } from "cmd-ts"
import fs from "fs/promises"
import cliSelect from "cli-select"
import { exec } from "node:child_process"
import doctestTsConfig from "../../../../tsconfig.doctest.json"

export const installCommand = command({
  name: "Installer",
  description: "Installs the-real-doctest default environment in the current project",
  args: {},
  handler: async args => {
    // Copy testing tsconfig
    await fs.writeFile(
      "./tsconfig.doctest.json",
      JSON.stringify(doctestTsConfig, null, 2),
      "utf8"
    )
    console.log(`Wrote ./tsconfig.doctest.json`)

    // Install dev dependencies
    console.log("Select your project's package manager:")
    const { value: packageManager } = await cliSelect({
      values: ["npm", "yarn", "pnpm", "bun"] as const,
      indentation: 2
    })

    let installDevSubCmd: Record<typeof packageManager, string> = {
      bun: "add -d",
      pnpm: "add -D",
      npm: "install -D",
      yarn: "add -D"
    }
    let installCmd = `${packageManager} ${installDevSubCmd[packageManager]} ts-node ts-patch`

    console.log(`Running ${installCmd}`)
    await new Promise((resolve, reject) => {
      exec(installCmd, (error, stdout, stderr) => {
        console.log(stderr)
        resolve(null)
      })
    })
    console.log("OK")

    // Put default test command in package.json
    console.log("Writing default config in package.json")
    const packageJson = JSON.parse(await fs.readFile("./package.json", "utf8"))
    packageJson["the-real-doctest"] = {
      runCommand:
        "npx ts-node --project tsconfig.doctest.json --compiler ts-patch/compiler"
    }
    await fs.writeFile("./package.json", JSON.stringify(packageJson, null, 2))
  }
})
