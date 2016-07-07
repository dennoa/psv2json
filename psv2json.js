'use strict';

const psv2json = require('./index.js');
const fs = require('fs');
const path = require('path');

function createJson(psv, json, options) {
  return new Promise((resolve, reject)=> {
    console.log('Processing ' + json);
    let psvStream = fs.createReadStream(psv, { encoding: 'utf8' });
    let jsonStream = fs.createWriteStream(json);
    psvStream.pipe(psv2json(options)).pipe(jsonStream)
      .on('close', resolve)
      .on('error', reject);
  });
}

function sanitizeDirname(dirname) {
  let normalized = path.normalize(dirname);
  return (normalized.charAt(normalized.length - 1) === '/') ? normalized : normalized + '/';
}

function getJsonDir() {
  let pos = process.argv.indexOf('--jsondir');
  return (pos > 2 && pos < (process.argv.length - 1)) ? sanitizeDirname(process.argv[pos+1]) : null;
}

function getHeaderTransformer() {
  return (process.argv.indexOf('--lowercaseheader') > 2) ? (header => header.toLowerCase()) : null;
}

function getJsonItemTransformer() {
  let pos = process.argv.indexOf('--jsonitemtransformer');
  return (pos > 2 && pos < (process.argv.length - 1)) ? require(process.argv[pos+1]) : null;
}

function exit(err) {
  if (err) {
    console.log('Failed!');
    console.log(err);
    return process.exit(1);
  }
  console.log('Completed sucessfully!');
}

if (process.argv.length < 3) {
  console.log('Usage:\n\n\tnode psv2json psv/dir [options]\n');
  console.log('Where psv/dir is the path to the directory holding the psv files to be transformed.\n');
  console.log('Options:');
  console.log('\t--jsondir dirname\tOutput the json files to dirname. If not specified, the json files will be written to the same directory as the psv files.');
  console.log('\t--lowercaseheader\tTransform the psv header line to lowercase.')
  console.log('\t--jsonitemtransformer module_name\tLoad the module identified by module_name and use it to transform each json item.')
  process.exit(1);
}

const psvdir = sanitizeDirname(process.argv[2]);
const jsondir = getJsonDir() || psvdir;
const options = {
  transformHeader: getHeaderTransformer(),
  transformJsonItem: getJsonItemTransformer()
};

fs.readdir(psvdir, (err, psvPaths)=> {
  if (err) { return exit(err); }
  let jsons = [];
  for (let psvPath of psvPaths.filter(name => name.lastIndexOf('.psv') === name.length - 4)) {
    let psv = psvdir + psvPath;
    let json = jsondir + psvPath.substring(0, psvPath.length - 4) + '.json';
    jsons.push(createJson(psv, json, options));
  }
  Promise.all(jsons).then(()=> {
    exit(); 
  }).catch(exit);
});
