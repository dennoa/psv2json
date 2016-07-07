'use strict';

const Transform = require('stream').Transform;

function escapeDoubleQuotes(chunk) {
	return chunk.replace(/"/g, '\\"');
}

function getLastLineEnd(chunk) {
	let lastLineEnd = chunk.lastIndexOf('\n');
	return (lastLineEnd < 0) ? chunk.length : lastLineEnd;
}

function quote(value) {
	return '"' + value.trim() + '"';
}

function psv2json(options) {
	let opts = options || {};
	opts.transformHeader = opts.transformHeader || (header=>header);
	opts.transformJsonItem = opts.transformJsonItem || (json=>json);
	let keys = [];
	let leftOver = '';
	
	function transformHeaderChunk(chunk) {
		let headerEnd = chunk.indexOf('\n');
		if (headerEnd < 0) {
			throw new Error('Could not read header line to determine field names');
		}
		let header = opts.transformHeader(chunk.substring(0, headerEnd));
		keys = header.split('|').map(quote);
		return chunk.substring(headerEnd);
	}

	const transformer = new Transform({
		decodeStrings: false,

		transform(chunk, encoding, callback) {
			if (keys.length === 0) { 
				chunk = transformHeaderChunk(chunk);
			}
			let lastLineEnd = getLastLineEnd(chunk);
			let lines = escapeDoubleQuotes(leftOver + chunk.substring(0, lastLineEnd)).split('\n');
			leftOver = chunk.substring(lastLineEnd);
			let jsonLines = [];
			for (let line of lines) {
				let fields = [];
				let values = line.split('|').map(quote);
				if (values.length === keys.length) {
					for (let i=0; i<values.length; i++) {
						fields.push(keys[i] + ':' + values[i]);
					}
					jsonLines.push(opts.transformJsonItem('{' + fields.join(',') + '}'));
				}
			}
			callback(null, jsonLines.join(',\n'));
		}

	});

	return transformer;
}

module.exports = psv2json;