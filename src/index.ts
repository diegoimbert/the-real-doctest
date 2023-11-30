import { array, command, multioption, number, oneOf, option, positional, run } from 'cmd-ts';
import { File } from 'cmd-ts/batteries/fs';
import { readFile } from 'node:fs/promises';
import { transformFileWithDoctests } from './doctest-processing/sourceComponents/fileRunner';
import { argv } from 'node:process';
import { generateTempPath, withTempFile } from './doctest-processing/withTempFile';
import { execSync } from 'node:child_process';
import { DOCTEST_RESULT_LOG_ID, DoctestResult } from './doctest-processing/sourceComponents/doctestRunner';
import { doctestOutputFormat, getFormatter } from './doctest-processing/formatter';

const cmd = command({
  name: 'The Real Doctest',
  description: 'Execute TSDoc examples',
  version: '0.0.1',
  args: {
    lines: multioption({
      long: 'line',
      short: 'l',
      type: array(number),
      description: "Doctest lines to be executed. Executes all if none specified"
    }),
    path: positional({
      type: File,
      displayName: 'path',
      description: "The file that contains the doctests to be run"
    }),
    outputFormat: option({
      long: 'output-format',
      defaultValue: () => "cli" as const,
      type: oneOf(doctestOutputFormat)
    }),
  },
  async handler({ lines, path, outputFormat }) {
    const doctestTempPath = generateTempPath(path, '.doctest.tmp')
    await withTempFile({
      path: doctestTempPath,
      content: transformFileWithDoctests({
        content: (await readFile(path)).toString(),
        path,
        ...lines.length && { filter: (d) => lines.includes(d.lineNumber + 1) },
      }),
      async fn() {
        const cmd = `node --import the-real-doctest --import tsx ${doctestTempPath}`
        const rawResult = execSync(cmd).toString()
        const result = rawResult.split('\n')
          .filter(line => line.startsWith(DOCTEST_RESULT_LOG_ID))
          .map(line => line.substring(DOCTEST_RESULT_LOG_ID.length))
          .map(line => JSON.parse(line) as DoctestResult)
        console.log(getFormatter(outputFormat)(result))
      }
    })
  },
});
run(cmd, argv.slice(2))