const _  = require('lodash');
const isobmff = require('./isobmff.json');

module.exports = function unflat(data) {
	const tree = [];

	_.forEach(_.sortBy(data, 'id'), function (obj, index, collection) {
		if (obj.parent !== 0) {
			addToParent(obj, tree);
		} else {
			addToTree(obj, tree)
		}
	});

	return tree;
}


function addToParent (data, tree) {
	var parent = findById(data.parent, tree);

	if (parent) {
		addToTree(data, parent.content);
	}
}


function addToTree (data, tree) {
	// if the data is just a buffer of binary data, we currently output "BINARY_DATA"
	//	might be nice to have a CLI flag to output the actual data then too...
	// content = (data.data instanceof Buffer) ? `BINARY_DATA (${data.length} bytes)` : data.data;

	let node = {
		id: data.id,
		type: data.type,
		location: data.location
	}

	// If data is buffer, return empty content. If it's a recognized container we'll do more later.
	// This makes sure we don't store entire buffers in the tree.
	if ((data.data instanceof Buffer)) {
		node.content = [];
	} else {
		node.content = data.data;
	}

	tree.push(node);
}


function findById (id, tree) {
	return _.reduce(tree, function (accumulator, item) {
		if (accumulator !== false) {
			return accumulator;
		}

		if (item.id === id) {
			return item;
		}

		if (item.content instanceof Array) {
			return findById(id, item.content)
		}

		return false;
	}, false);
}