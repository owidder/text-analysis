'use strict';

var fs = require('fs');
var _ = require('lodash');
var math = require('math');

var relPath = require('./relPath');

var VECTORS_FILE_PATH = '../python/python-lsi/data/vectors.csv';

var vectors = {};

function extractVector(line) {
    var parts = line.split("\t");
    parts.splice(0, 1);
    var vector = parts.map(function (e) {
        return Number(e);
    });

    return vector;
}

function extractRelPath(line) {
    var parts = line.split("\t");
    var relPath = relPath.makeRelPath(parts[0]);

    return relPath;
}

function processVectorLine(line) {
    var relPath = extractRelPath(line);
    var vector = extractVector(line);

    vectors[relPath] = vector;
}

function readVectors() {
    var content = fs.readFileSync(VECTORS_FILE_PATH, 'utf8');
    var lines = content.split("\n");
    lines.forEach(function (line) {
        processVectorLine(line);
    });
}

function getVectorForFile(fileRelPath) {
    return vectors[fileRelPath];
}
