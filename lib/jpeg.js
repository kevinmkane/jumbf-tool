/*jslint browser: true, devel: true, bitwise: false, debug: true, eqeq: false, es5: true, evil: false, forin: false, newcap: false, nomen: true, plusplus: true, regexp: false, unparam: false, sloppy: true, stupid: false, sub: false, todo: true, vars: true, white: true */

export function parseSections(stream, iterator) {
  let len, markerType;
  stream.setBigEndian(true);
  //stop reading the stream at the SOS (Start of Stream) marker,
  //because its length is not stored in the header so we can't
  //know where to jump to. The only marker after that is just EOI (End Of Image) anyway
  while (stream.remainingLength() > 0 && markerType !== 0xda) {
    if (stream.nextUInt8() !== 0xff) {
      throw new Error('Invalid JPEG section offset');
    }
    markerType = stream.nextUInt8();
    //don't read size from markers that have no datas
    if ((markerType >= 0xd0 && markerType <= 0xd9) || markerType === 0xda) {
      len = 0;
    } else {
      len = stream.nextUInt16() - 2;
    }
    iterator(markerType, stream.branch(0, len));
    stream.skip(len);
  }
}

//stream should be located after SOF section size and in big endian mode, like passed to parseSections iterator
export function getSizeFromSOFSection(stream) {
  stream.skip(1);
  return {
    height: stream.nextUInt16(),
    width: stream.nextUInt16(),
  };
}

export function getSectionName(markerType) {
  let name, index;
  switch (markerType) {
    case 0xd8:
      name = 'SOI';
      break;
    case 0xc4:
      name = 'DHT';
      break;
    case 0xdb:
      name = 'DQT';
      break;
    case 0xdd:
      name = 'DRI';
      break;
    case 0xda:
      name = 'SOS';
      break;
    case 0xfe:
      name = 'COM';
      break;
    case 0xd9:
      name = 'EOI';
      break;
    default:
      if (markerType >= 0xe0 && markerType <= 0xef) {
        name = 'APP';
        index = markerType - 0xe0;
      } else if (
        markerType >= 0xc0 &&
        markerType <= 0xcf &&
        markerType !== 0xc4 &&
        markerType !== 0xc8 &&
        markerType !== 0xcc
      ) {
        name = 'SOF';
        index = markerType - 0xc0;
      } else if (markerType >= 0xd0 && markerType <= 0xd7) {
        name = 'RST';
        index = markerType - 0xd0;
      }
      break;
  }
  let nameStruct = {
    name: name,
  };
  if (typeof index === 'number') {
    nameStruct.index = index;
  }
  return nameStruct;
}
