function json_parse(data) {
  let decoder = new TextDecoder();
  const dataAsString = decoder.decode(data);
  const obj = JSON.parse(dataAsString);
  return obj;
}

function json_build(data) {
  // do nothing on building...
  return data;
}

let box_json = {
  parse: json_parse,
  build: json_build,
};

export { box_json };
