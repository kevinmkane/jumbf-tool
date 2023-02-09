function sidx_parse(data) {
  let bp = new DataView(data),
    version = bp.getUint8(0),
    flags = (bp.getUint16(1) << 8) + bp.getUint8(3),
    referenceId = bp.getUint32(4),
    timeScale = bp.getUint32(8),
    earliestPresentationTime =
      version === 0 ? bp.getUint32(12) : bp.getBigUint64(12),
    firstOffset = version === 0 ? bp.getUint32(16) : bp.getBigUint64(20),
    entryCount = bp.getUint16(version === 0 ? 22 : 30),
    entries = [],
    offset = version === 0 ? 24 : 32;

  for (let i = entryCount; i > 0; i -= 1) {
    entries.push({
      referencedSize: bp.getUint32(offset),
      subSegmentDuration: bp.getUint32(offset + 4),
      unused: bp.getUint32(offset + 8),
    });
    // TODO (kkane): The MP4 spec lists three more fields that aren't mentioned in this code. Do we need them?
    // If so, offset should get increased by another 4 bytes.
    offset += 12;
    // dump the rest we dont need now
  }

  return {
    version: version,
    flags: flags,
    referenceId: referenceId,
    timeScale: timeScale,
    earliestPresentationTime: earliestPresentationTime,
    firstOffset: firstOffset,
    entries: entries,
  };
}

function sidx_build(data) {
  let outputSize =
    1 + // version
    3 + // flags
    4 + // reference_ID
    4 + // timescale
    (version === 0)
      ? 4
      : 8 + // earliest_presentation_time
        (version === 0)
      ? 4
      : 8 + // first_offset
        2 + // reserved
        2 + // reference_count,
        reference_count * 12;
  // TODO (kkane): See note above about three other fields in sidx box mentioned in MP4 spec.

  let buf = new Uint8Array(outputSize);
  let bufView = new DataView(buf);
  let offset = 0;

  bufView.setUint8(0, data.version);
  bufView.setUint16(1, (data.flags & 0xffff00) >> 8);
  bufView.setUint8(3, data.flags & 0xff);
  bufView.setUint32(4, data.referenceId);
  bufView.setUint32(8, data.timeScale);
  if (version === 0) {
    bufView.setUint32(12, data.earliestPresentationTime);
    bufView.setUint32(16, data.firstOffset);
    bufView.setUint16(20, 0);
    bufView.setUint16(22, data.reference_count);
    offset = 24;
  } else {
    bufView.setBigUint64(12, data.earliestPresentationTime);
    bufView.setBigUint64(20, data.firstOffset);
    bufView.setUint16(28, 0);
    bufView.setUint16(30, data.entries.length);
    offset = 32;
  }

  for (let i = 0; i < data.entries.length; i++) {
    bufView.setUint32(offset, data.entries[i].referencedSize);
    bufView.setUint32(offset + 4, data.entries[i].subSegmentDuration);
    bufView.setUint32(offset + 8, data.entries[i].unused);
    offset += 12;
    // TODO (kkane): See above about discrepancy between this existing code and definition of sidx box in the MP4 spec.
  }

  return buf;
}

let box_sidx = {
  parse: sidx_parse,
  build: sidx_build,
};

export { box_sidx };
