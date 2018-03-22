#! /usr/bin/env node
'use strict';

const path = require('path');
const program = require('commander');

const validator = require('../lib/validator');
const generate = require('../lib/generate');
const clean = require('../lib/clean');
const commandPkg = require('../package');

const cwd = process.cwd();
const isValid = validator(cwd);

if (!isValid) {
  // eslint-disable-next-line no-console
  console.error('Please run speculate from within a valid Node.js project');
  process.exit(1);
}

const projectPkg = require(path.resolve(cwd, './package.json'));

program
  .version(commandPkg.version)
  .option('-r --release <release>', 'Specify release number of package')
  .option('-n --name <name>', 'Specify custom name for package')
  .parse(process.argv);

// Commander has a magic property called name when not overridden by a parameter
const name = program.name instanceof Function ? undefined : program.name;

async function runTasks() {
  clean(cwd, projectPkg);

  try {
    const files = await generate(cwd, projectPkg, program.release, name);
    files.forEach((file) => {
      // eslint-disable-next-line no-console
      console.log('Created ./%s', file);
    });
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error:', err.message);
    process.exit(1);
  }
}

runTasks();
