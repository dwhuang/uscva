'use strict';

var fs = require('fs');
var glob = require('glob');

const args = process.argv.slice(2);
if (args.length != 1) {
  console.log('[Error] Missing input directory path');
  process.exit(1);
}

const passageFailPattern = new RegExp(/failed|defeated|rejected/, 'i');
const inputDir = args[0];
const files = glob.sync(inputDir + '/**/*.json');

for (const file of files) {
  const fileContent = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (fileContent['category'] !== 'passage') {
    continue;
  }

  const billPassed = !passageFailPattern.test(fileContent['result']);
  if (billPassed) {
    // TODO
  } else {
    // TODO
  }
}
