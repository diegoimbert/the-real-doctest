import { array, command, multioption, number, positional, run, string } from 'cmd-ts';
import { File } from 'cmd-ts/batteries/fs';
import { readFile } from 'node:fs/promises';
import { transformFileWithDoctests } from './doctest-processing/sourceComponents/fileRunner';
import { argv } from 'node:process';
import { generateTempPath, withTempFile } from './doctest-processing/withTempFile';

const cmd = command({
  name: 'The Real Doctest',
  description: 'Execute TSDoc examples',
  version: '1.0.0',
  args: {
    lines: multioption({
      long: 'line',
      short: 'l',
      type: array(number),
    }),
    path: positional({ type: File, displayName: 'path' }),
  },
  async handler({lines, path}) {
    await withTempFile({
      path: generateTempPath(path, '.doctest.tmp'),
      content: transformFileWithDoctests({
        content: (await readFile(path)).toString(),
        path,
        ...lines.length && { filter: (d) => lines.includes(d.lineNumber + 1) },
      }),
      async fn() {
        
      }
    })
  },
});
run(cmd, argv.slice(2))