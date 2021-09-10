var fs = require('fs');
const chalk = require('chalk')
const errMsg = chalk.bold.red;

var unflat = require('./unflat.js');
var unbox = require('./unbox.js');
var jpeg = require('./jpeg.js')

function parseStream( fs ) {
	var start = fs.mark(),
		stream = start.openWithOffset(0),
		flags = {
			simplifyValues: true,
			imageSize: true
		};
	var jumbfArr = [];

	jpeg.parseSections(stream, function(sectionType, sectionStream) {
		var validExifHeaders, sectionOffset = sectionStream.offsetFrom(start);
		var sect = jpeg.getSectionName(sectionType), sectName = sect.name;
		if(typeof sect.index === 'number') {
			sectName += `${sect.index}`;
		}

		// console.log(`${sectName} starts at ${sectionOffset}`);

		if( sectName == "APP11") {
			// the 8 skips over the standard `JP` APP11 marker to the JUMBF itself
			var appBuffer = sectionStream.buffer.slice(sectionOffset+8, sectionStream.length);
			jumbfArr.push( appBuffer );
		}
		else if(flags.imageSize && jpeg.getSectionName(sectionType).name === 'SOF') {
			imageSize = jpeg.getSizeFromSOFSection(sectionStream);
		}
	});

	var jumbfBuff = Buffer.concat(jumbfArr);
	return jumbfBuff;
}

function parseJPEG(fPath) {
	try {
		var fileBuffArr = [];

		var fStream = fs.createReadStream(fPath, {
			flags: 'r',
			encoding: null,
			fd: null,
			mode: 0666,
			autoClose: true
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
			
			var NodeBufferStream = require('./bufferstream.js');
			var stream = new NodeBufferStream(fileBuffer, 0, fileBuffer.length, true);
	
			// and parse it!
			var jumbf = parseStream( stream );
			if ( jumbf.length > 0 ) {
				boxes = [];
				var boxFragment = unbox(jumbf, 0, boxes.push.bind(boxes));
				var outObj = unflat(boxes);
				console.log(JSON.stringify(outObj, null, 4));	
			} else {
				console.error(errMsg("No JUMBF found!")); 
			}
		});

		// Data is flushed from fileStream in chunks,
		// this callback will be executed for each chunk
		fStream.on('data', (chunk) => {
			fileBuffArr.push(chunk); // push data chunk to array
		});
	} catch (err) {
		console.error(errMsg(err))
	}
}

module.exports = parseJPEG