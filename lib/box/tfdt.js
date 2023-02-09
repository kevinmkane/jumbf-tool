function tfdt_parse(data) {
  let bp = new DataView(data),
    version = bp.getUint8(0),
    flags = (bp.getUint16(1) << 8) + bp.getUint8(3),
    baseMediaDecodeTime = version === 1 ? bp.getUint64(4) : bp.getUint32(4);

  return {
    version: version,
    flags: flags,
    baseMediaDecodeTime: baseMediaDecodeTime,
  };
}

function tfdt_build(data) {
  let buf = new Uint8Array(data.version === 1 ? 12 : 8);
  let bufView = new DataView(buf);

  bufView.setUint8(0, data.version);
  bufView.setUint16(1, (data.flags & 0xffff00) >> 8);
  bufView.setUint8(3, data.flags & 0xff);

  if (data.version === 1) {
    bufView.setBigUint64(4, data.baseMediaDecodeTime);
  } else {
    bufView.setUint32(4, data.baseMediaDecodeTime);
  }

  return buf;
}

let box_tfdt = {
  parse: tfdt_parse,
  build: tfdt_build,
};

export { box_tfdt };
