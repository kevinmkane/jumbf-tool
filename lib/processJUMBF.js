import { unflat } from './unflat.js';
import { unbox } from './unbox.js';

// given a Buffer to a JUMBF container
// this method will JSON-ify it and log that to console
export function processJUMBF(jumbf) {
  if (jumbf.length > 0) {
    let boxes = [];
    unbox(jumbf, 0, boxes.push.bind(boxes));
    return unflat(boxes);
  } else {
    console.error('No JUMBF found!');
  }
}
