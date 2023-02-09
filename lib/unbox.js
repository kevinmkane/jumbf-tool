import { getBoxType } from './getBoxType.js';
import { boxParse } from './boxparse.js';

var id = 0;

function getId() {
  id += 1;
  return id;
}

/**
 *
 * @param buf
 * @param parent
 * @param output
 * @returns {{currentLength: *, length: *, parent: *, type: *, data: *}}
 */
export function unbox(buf, parent, output) {
  let bp = new DataView(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    ),
    bufferLength = buf.length, // bp.buffer.length,
    offset = 0,
    length,
    boxType,
    typeData,
    boxData,
    id;

  // Will be true for the top-level box, so we set the location here so we have it for recursive calls to unbox.
  if (buf.location === undefined) {
    buf.location = {
      byteOffset: buf.byteOffset,
      byteLength: buf.byteLength,
    };
  }

  // Stop when there isn't enough room left in the buffer for another length and type field (2 x UInt32).
  while (bufferLength >= 8) {
    length = bp.getUint32(offset, false); // returns byteLength,
    typeData = bp.getUint32(offset + 4, false);
    boxType = getBoxType(typeData);

    if (length == 0 || !boxType || boxType == '') {
      return;
    }

    if (bufferLength - length < 0) {
      id = getId();
      return {
        id: id,
        currentLength: bufferLength,
        length: length,
        parent: parent,
        type: boxType,
        data: buf.slice(offset + 8, bufferLength),
      };
    }

    boxData = buf.slice(offset + 8, offset + length);

    let location = {
      byteOffset: buf.location.byteOffset + offset + 8,
      byteLength: length - 8,
    };

    offset += length;
    bufferLength -= length;

    id = getId();

    boxData = boxParse(boxType, boxData);
    boxData.location = location;

    if (boxParse.isBoxContainer(boxType)) {
      unbox(boxData, id, output);
    }

    output({
      id: id,
      length: length,
      parent: parent,
      type: boxType,
      data: boxData,
      location: location,
    });
  }
}
