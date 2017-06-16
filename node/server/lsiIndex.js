'use strict';

var fs = require('fs');
var _ = require('lodash');

var INDEX_FILE_PATH = '../python/python-lsi/data/matrix.csv';
var BASE_PATH = '/Users/owidder/dev/iteragit/nge/python/erpnext/';
var SUFFIX = ".utf8";

var index = {};
var matrix = [];
var nodes = [];

function removeBasePath(absPath) {
    return absPath.substr(BASE_PATH.length);
}

function removeSuffix(name) {
    return name.substr(0, name.length - SUFFIX.length);
}

function makeRelPath(path) {
    return removeSuffix(removeBasePath(path));
}

function processIndexLine(line) {
    var parts = line.split("\t");
    var entry = {};
    var i, fromRelPath, fromAbsPath, toRelPath, toAbsPath;
    if(parts.length > 2) {
        fromAbsPath = parts[0];
        fromRelPath = makeRelPath(fromAbsPath);
        for (i = 1; i < parts.length; i+=2) {
            toAbsPath = parts[i];
            toRelPath = removeBasePath(toAbsPath);
            entry[toRelPath] = parts[i+1];
        }
        index[fromRelPath] = entry;
    }
}

function readIndex() {
    var content = fs.readFileSync(INDEX_FILE_PATH, 'utf8');
    var lines = content.split("\n");
    lines.forEach(function (line) {
        processIndexLine(line);
    });
}

function initNodes() {
    if(_.isEmpty(index)) {
        readIndex();
    }

    _.forOwn(index, function (_dummy_, absPath) {
        var relPath = makeRelPath(absPath);
        addNode(relPath);
    });
}

function initMatrix() {
    if(_.isEmpty(index)) {
        readIndex();
    }

    _.forOwn(index, function (entry, fromRelPath) {
        var fromRelPath = makeRelPath(fromRelPath);
        _.forOwn(entry, function (weight, toRelPath) {
            var toRelPath = removeSuffix(toRelPath);
            matrix.push({
                source: fromRelPath,
                target: toRelPath,
                count: weight*1000
            })
        })
    })
}

function readMatrixAndNodes() {
    if(_.isEmpty(matrix)) {
        initMatrix();
    }

    if(_.isEmpty(nodes)) {
        initNodes();
    }

    return {
        cities: nodes,
        links: matrix
    }
}

function findNode(relPath) {
    nodes.find(function (node) {
        return node.name == relPath;
    })
}

function addNode(relPath) {
    var pathParts = relPath.split("/");
    var indexOfLastPart = pathParts.length-1;
    var filename = pathParts[indexOfLastPart];
    nodes.push({
        kennzeichen: filename,
        name: relPath,
        bundesland: (pathParts[0] == filename ? "." : pathParts[0])
    })
}

function addLink(fromRelPath, toRelPath, value) {
    matrix.push({
        source: fromRelPath,
        target: toRelPath,
        count: value*1000
    });
}

function _getCoronaRecursive(fromRelPath, currentDepth) {
    if(_.isEmpty(findNode(fromRelPath))) {
        addNode(fromRelPath);
    }

    if(currentDepth > 0) {
        if(!_.isEmpty(index[fromRelPath])) {
            _.forOwn(index[fromRelPath], function (value, toRelPath) {
                var toRelPathWithoutSuffix = removeSuffix(toRelPath);
                addLink(fromRelPath, toRelPathWithoutSuffix, value);
                _getCoronaRecursive(toRelPathWithoutSuffix, currentDepth-1);
            })
        }
    }
}

function getCorona(relPath, maxDepth) {
    if(_.isEmpty(index)) {
        readIndex();
    }

    matrix = [];
    nodes = [];

    _getCoronaRecursive(relPath, maxDepth);
    return {
        cities: nodes,
        links: matrix
    }
}

function getIndexEntry(relPath) {
    if(_.isEmpty(index)) {
        readIndex();
    }

    var entry = index[relPath];
    return entry;
}

module.exports = {
    getIndexEntry: getIndexEntry,
    readMatrixAndNodes: readMatrixAndNodes,
    getCorona: getCorona
};
