'use strict';

var fs = require('fs');
var _ = require('lodash');
var math = require('mathjs');

var _relPath = require('./relPath');

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
    var path = _relPath.makeRelPath(parts[0]);

    return path;
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

function createHistoDataForFile(fileRelPath) {
    if(_.isEmpty(vectors)) {
        readVectors();
    }

    var ownVec = getVectorForFile(fileRelPath);
    var data = [];
    _.forOwn(vectors, function (vector, relPath) {
        if(relPath != fileRelPath && !_.isEmpty(relPath) && vector.length == ownVec.length) {
            var prod = math.multiply(ownVec, vector) / (math.norm(ownVec) * math.norm(vector));
            data.push(prod);
        }
    });

    return data;
}

module.exports = {
    createHistoDataForFile: createHistoDataForFile
};
