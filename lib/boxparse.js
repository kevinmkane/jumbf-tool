const isobmff = {
  boxContainers: [
    'avc1',
    'dinf',
    'edts',
    'ilst',

    'jumb',
    'mdia',

    'minf',
    'moov',
    'moof',
    'mvex',
    'stbl',

    'traf',
    'trak',
    'udta',
  ],
  needParseInfo: ['dref', 'meta', 'stsd'],
  parseInfo: {
    tfdt: {
      version: {
        length: 8,
      },
      flags: {
        length: 24,
      },
      baseMediaDecodeTime: {
        length: 32,
        type: 'decimal',
      },
    },
  },
};

import { box_bfdb } from './box/bfdb.js';
import { box_bidb } from './box/bidb.js';
import { box_cbor } from './box/cbor.js';
import { box_json } from './box/json.js';
import { box_jumb } from './box/jumb.js';
import { box_jumd } from './box/jumd.js';
import { box_moof } from './box/moof.js';
import { box_sidx } from './box/sidx.js';
import { box_tfdt } from './box/tfdt.js';
import { box_traf } from './box/traf.js';

var boxes = {
  bfdb: box_bfdb,
  bidb: box_bidb,
  cbor: box_cbor,
  json: box_json,
  jumb: box_jumb,
  jumd: box_jumd,
  moof: box_moof,
  sidx: box_sidx,
  tfdt: box_tfdt,
  traf: box_traf,
};

export function boxParse(type, data) {
  if (boxes[type]) {
    if (typeof boxes[type].parse == 'undefined') {
      throw new Error('lib/box/' + type + ' is missing parse method');
    }

    return boxes[type].parse(data);
  } else {
    return data;
  }
}

boxParse.isBoxContainer = function (type) {
  return isobmff.boxContainers.indexOf(type) > -1;
};
