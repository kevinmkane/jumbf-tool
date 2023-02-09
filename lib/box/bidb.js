function bidb_parse(data) {
  // do nothing - just return the data
  return data;
}

function bidb_build(data) {
  // do nothing on building...
  return data;
}

let box_bidb = {
  parse: bidb_parse,
  build: bidb_build,
};

export { box_bidb };
