import hexy from 'hexy';
import { BufferStream } from './bufferstream.js';
import * as jpeg from './jpeg.js';

let dump = false;

// hex dumps a buffer to the console (in my preferred format)
function hexDump(data, sectionOffset) {
  if (dump) {
    let format = {};
    format.format = 'twos'; // every two bytes
    format.offset = sectionOffset;
    format.length = 32;
    console.log(hexy.hexy(data, format));
  }
}

function parseJpegStream(fs) {
  let start = fs.mark(),
    stream = start.openWithOffset(0),
    jumbfArr = [],
    foundApp11 = false;

  jpeg.parseSections(stream, function (sectionType, sectionStream) {
    let sectionOffset = sectionStream.offsetFrom(start);
    let sect = jpeg.getSectionName(sectionType),
      sectName = sect.name;
    if (typeof sect.index === 'number') {
      sectName += `${sect.index}`;
    }

    // console.log(`${sectName} starts at ${sectionOffset}`);

    if (sectName == 'APP11') {
      hexDump(sectionStream.buffer, sectionOffset);

      // the 8 skips over the standard `JP` APP11 marker to the JUMBF itself
      // unless this is a secondary one, then we need to skip 16 bytes (passed the header)
      let offset = foundApp11 ? 16 : 8;
      let len = sectionStream.length;
      /*if ( sectionStream.buffer[sectionOffset + offset + 2] == 0x00 ) {
				offset += 2;
      }*/
      let startLoc = sectionOffset + offset;
      let appBuffer = sectionStream.buffer.slice(
        startLoc,
        startLoc + len - offset,
      );

      hexDump(appBuffer, 0);

      jumbfArr.push(appBuffer);
      foundApp11 = true;
    }
  });

  let jumbfBuff = Buffer.concat(jumbfArr);
  return jumbfBuff;
}

export function parseJPEG(fileContents) {
  // convert the Node Buffer into something we can run through the JPEG parser
  let stream = new BufferStream(fileContents, 0, fileContents.length, true);

  // parse it!
  return parseJpegStream(stream);
}
