// Copyright (c) 2024 Diego Imbert
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import fs from "fs/promises"

/**
 * For some reason, the transformers don't work when it's inside node_modules.
 * The workaround is to copy the library outside whenever we need to run a test
 */

const copiedLibPath = "./.the-real-doctest-tmp"
const nodeModulesLibPath = "./node_modules/the-real-doctest"

interface WithLibArgs {
  handler: (args: { rootPath: string }) => void | Promise<void>
  forceCopy?: boolean
}

// This function allows a handler to use all the-real-doctest library files
// (as in present in the dist folder)
export async function withLib({
  handler,
  forceCopy = false
}: WithLibArgs): Promise<void> {
  if (!forceCopy) {
    await handler({ rootPath: nodeModulesLibPath })
    return
  }

  try {
    await fs.cp(nodeModulesLibPath, copiedLibPath, {
      force: true,
      recursive: true
    })
    await handler({ rootPath: copiedLibPath })
  } finally {
    await fs.rm(copiedLibPath, { recursive: true, force: true })
  }
}
