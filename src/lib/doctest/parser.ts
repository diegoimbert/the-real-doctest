export interface ParseDoctestsParams {
  path: string
  content: string
}

/**
 * Returns the doctests from a source file
 *
 * @param content a .ts file content
 * @returns every comment line
 */
export function parseDoctests(params: ParseDoctestsParams): Doctest[] {
  const content = params.content.toString()
  const fileLines = content.split("\n")
  let blocks: Doctest[] = []

  let currentDoctestBlock: Doctest | null = null

  function saveBlockAndReset() {
    if (currentDoctestBlock && currentDoctestBlock.content.trim() != "") {
      blocks.push(currentDoctestBlock)
    }
    currentDoctestBlock = null
    state = "Default"
  }

  let state: "Default" | "InDoctest" = "Default"
  for (let i = 0; i < fileLines.length; ++i) {
    const line = fileLines[i]

    if (state == "InDoctest") {
      if (!currentDoctestBlock) {
        throw new Error("Why is currentDoctestBlock null?")
      }
      const commentEnd = /^\s*\*\//
      const docTagStart = /^\s*\*\s*@/
      if (line.match(commentEnd) || line.match(docTagStart)) {
        saveBlockAndReset()
      } else {
        const contentStart = /^\s*\*(.*)/.exec(line)
        if (!contentStart) {
          console.warn(`Non-terminated doctest block (line ${i})`)
          saveBlockAndReset()
        } else {
          currentDoctestBlock.content += "\n" + contentStart[1].trim()
        }
      }
    }

    if (state == "Default") {
      const doctestStart = /^\s*\*\s*@example(.*)/.exec(line)
      if (doctestStart) {
        // This corresponds to what follows immediately after the @example,
        // on the same line
        currentDoctestBlock = {
          path: params.path,
          lineNumber: i,
          content: doctestStart[1].trim()
        }
        state = "InDoctest"
      }
    }
  }
  return blocks
}

export interface Doctest {
  path: string
  lineNumber: number
  content: string
}
