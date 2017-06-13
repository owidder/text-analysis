'use strict';

var fs = require('fs');
var _ = require('lodash');

var INDEX_FILE_PATH = '../python/python-lsi/data/matrix.csv';
var BASE_PATH = '/Users/owidder/dev/iteragit/nge/python/erpnext/';

var index = {};

function processIndexLine(line) {
    var parts = line.split("\t");
    var entry = {};
    var i;
    if(parts.length > 2) {
        for (i = 1; i < parts.length; i+=2) {
            entry[parts[i]] = parts[i+1];
        }
        index[parts[0]] = entry;
    }
}

function readIndex() {
    var content = fs.readFileSync(INDEX_FILE_PATH, 'utf8');
    var lines = content.split("\n");
    lines.forEach(function (line) {
        processIndexLine(line);
    });
}

function getIndexEntry(relPath) {
    if(_.isEmpty(index)) {
        readIndex();
    }

    var key = BASE_PATH + relPath + ".utf8";
    var entry = index[key];
    return entry;
}

module.exports = {
    getIndexEntry: getIndexEntry
};
