'use strict';

require('colors');

const path = require('path');
const fs = require('fs');
const series = require('raptor-async/series');
const {exec} = require('child_process');
const Promise = require('bluebird');
const prompt = require('prompt');

async function getFiles(files, pathExp)
{
  return Promise.reduce(files, (res, file)=>{
    let command = `find ${file} -type f -iname "*.js"`;
    if (pathExp)
    {
      command = `${command} -ipath "${pathExp}"`;
    }
    command = `${command} ! -path "*/node_modules/*"`;
    return new Promise((resolve, reject)=>{
      exec(command, (error, stdout, stderr) => {
        if (error)
        {
          console.log(stderr);
          reject(error);
          return;
        }
        const list = stdout
          .split('\n')
          .map(item=>item.trim())
          .filter(item=>item);
        resolve(list.concat(res));
      });
    });
  }, []);
}

function processFiles(files, options) {
  const remove = options.remove;

  files.forEach((file) => {
    let contents = file.contents;

    if (remove) {
      let match = file.match;
      const occurrences = [];

      do {
        occurrences.push([match.index, match[0]]);
      } while ((match = file.regex.exec(contents)) !== null);

      let i = occurrences.length;
      while (--i >= 0) {
        const occurrence = occurrences[i];
        const pos = occurrence[0];
        const str = occurrence[1];
        contents = contents.substring(0, pos) + contents.substring(pos + str.length);
      }
    } else {
      contents = `${options.prefer}\n\n${contents}`;
    }

    fs.writeFileSync(file.absolutePath, contents, {encoding: 'utf8'});
  });
}

async function run(options) {
  options.prefer = options.prefer || '\'use strict\';';
  const pathExp = options.match;

  let dir = options.dir || process.cwd();

  const work = [];

  if (!Array.isArray(dir)) {
    dir = [dir];
  }

  if (dir.length === 0) {
    dir.push(process.cwd());
  }

  for (let i = 0; i < dir.length; i++) {
    dir[i] = path.resolve(process.cwd(), dir[i]);
  }

  console.log('\nScanning following directories or files:');
  dir.forEach((item) => {
    console.log(`${(` - ${item}`).gray}`);
  });
  console.log();
  options.remove = (options.remove === true);
  const remove = options.remove;


  const allFiles = await getFiles(dir, pathExp);
  const files = [];

  function onFile(file) {
    if (!file.endsWith('.js'))
    {
      return;
    }
    const contents = fs.readFileSync(file, {encoding: 'utf8'});
    const regex = /(?:'use strict'|"use strict");?(\r?\n)+/g;
    const match = regex.exec(contents);

    if ((match && remove) || (!match && !remove)) {
      files.push({
        absolutePath: path.resolve(file),
        relativePath: file,
        match,
        contents,
        regex,
      });
    }
  }
  allFiles.forEach((file) => {
    onFile(file, path.dirname(file));
  });

  series(work, (err) => {
    if (!files.length) {
      console.log('No files need to be updated.');
      return;
    }

    if (remove) {
      console.log('"use strict" statement will be removed from the following files:');
    } else {
      console.log(`${options.prefer} will be added to the following files:`);
    }
    files.forEach(file=>console.log(`${(` - ${file.relativePath}`).green}`));
    console.log('');

    prompt.message = '';
    prompt.delimiter = '';

    //
    // Start the prompt
    //
    prompt.start();

    //
    // Get two properties from the user: username and email
    //
    prompt.get([{
      name: 'answer',
      description: 'Continue?',
      required: true,
      default: 'yes',
    }], (err2, result) => {
      const answer = result.answer.toLowerCase();
      if ((answer === 'y') || (answer === 'yes')) {
        processFiles(files, options);
      } else {
        console.log('Operation canceled'.red);
      }
    });
  });
}

module.exports = {run};
