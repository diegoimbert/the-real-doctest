import { readFile } from 'node:fs/promises';

export async function main(path: string) {
  const content = (await readFile(path)).toString()
  
  return source
}