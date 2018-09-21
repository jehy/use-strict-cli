'use strict';

require('colors');
const yargs = require('yargs');

const program = require('../');

function add(args)
{
  program.run({
    remove: false,
    prefer: args.prefer,
    match: args.match,
    dir: args.files,
  });
}
function remove(args)
{
  program.run({
    remove: true,
    prefer: args.prefer,
    match: args.match,
    dir: args.files,
  });
}

// eslint-disable-next-line no-unused-expressions
yargs.usage('Usage: $0 <command> [options]')
  .command('add', 'Add strict mode to files', {}, add)
  .command('remove', 'Remove strict mode from files', {}, remove)
  .example('$0 add --files bin test --only *tests*')
  .option('files', {
    type: 'array',
    demandOption: true,
    describe: 'filenames',
  })
  .option('prefer', {
    type: 'string',
    nargs: 1,
    describe: 'Preferred "use strict" statement (e.g. \'"use strict";\')',
    default: false,
  })
  .option('match', {
    type: 'string',
    nargs: 1,
    describe: 'path must match this regexp',
    default: false,
  })
  .help('h')
  .alias('h', 'help')
  .argv;
