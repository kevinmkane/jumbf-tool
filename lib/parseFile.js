var fs = require('fs');
const chalk = require('chalk');

const processJUMBF = require('./processJUMBF.js');

const errMsg = chalk.bold.red;

function parseFile(fPath) {
  try {
    var fileBuffArr = [];

    var fStream = fs.createReadStream(fPath, {
      flags: 'r',
      encoding: null,
      fd: null,
      mode: 0o666,
      autoClose: true,
    });

    // An error occurred with the stream
    fStream.once('error', (err) => {
      // Be sure to handle this properly!
      console.error(errMsg(err));
    });

    // File is done being read
    fStream.once('end', () => {
      // create the final data Buffer from data chunks;
      fileBuffer = Buffer.concat(fileBuffArr);

      // and do something with it (like dump to console)
      processJUMBF(fileBuffer);
    });

    // Data is flushed from fileStream in chunks,
    // this callback will be executed for each chunk
    fStream.on('data', (chunk) => {
      fileBuffArr.push(chunk); // push data chunk to array

      // We can perform actions on the partial data we have so far!
    });
  } catch (err) {
    console.error(errMsg(err));
  }
}

module.exports = parseFile;
