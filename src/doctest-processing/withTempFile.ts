import * as fs from "fs"
import { extname } from "path"

/**
 * Creates a temporary file at `path` with content `content`,
 * executes fn and deletes the file.  
 * The function fails if path already exists
 */
export async function withTempFile({ path, content, fn }: {
  path: string,
  content: string,
  fn: () => void,
}) {
  try {
    if (fs.existsSync(path)) throw new Error(`Temp file '${path}' already exists`)
    fs.writeFileSync(path, content)
    await fn()
  } finally {
    fs.rmSync(path)
  }
}

/**
 * Generates a temp path while keeping the original extension 
 * 
 * @example generateTempPath('./lib/util.ts', '.tmp') === './lib/util.tmp.ts' 
 */
export function generateTempPath(path: string, tempExtention: string): string {
  const ext = extname(path)
  return path.substring(0, path.length - ext.length) + tempExtention + ext
}