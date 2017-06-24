'use strict';

var fs = require('fs');
var _ = require('lodash');

var INDEX_FILE_PATH = '../python/python-lsi/data/matrix.csv';

var index = {};
var matrix = [];
var nodes = [];

var relPath = require('./relPath');

function processIndexLine(line) {
    var parts = line.split("\t");
    var entry = {};
    var i, fromRelPath, fromAbsPath, toRelPath, toAbsPath;
    if(parts.length > 2) {
        fromAbsPath = parts[0];
        fromRelPath = relPath.makeRelPath(fromAbsPath);
        for (i = 1; i < parts.length; i+=2) {
            toAbsPath = parts[i];
            toRelPath = relPath.removeBasePath(toAbsPath);
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
        var relPath = relPath.makeRelPath(absPath);
        addNode(relPath, 0, nodes);
    });
}

function initMatrix() {
    if(_.isEmpty(index)) {
        readIndex();
    }

    _.forOwn(index, function (entry, fromRelPath) {
        var fromRelPath = relPath.makeRelPath(fromRelPath);
        _.forOwn(entry, function (weight, toRelPath) {
            var toRelPath = relPath.removeSuffix(toRelPath);
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

function findNode(relPath, _nodes) {
    return _nodes.find(function (node) {
        return node.name == relPath;
    })
}

function findLink(fromRelPath, toRelPath, _links) {
    return _links.find(function (link) {
        return (link.source == fromRelPath && link.target == toRelPath) || (link.target == fromRelPath && link.source == toRelPath);
    });
}

function updateDepth(relPath, depth, _nodes) {
    var existingNode = findNode(relPath, _nodes);
    if(existingNode != null) {
        if(existingNode.depth > depth) {
            existingNode.depth = depth;
        }
    }
}
function addNode(relPath, depth, _nodes) {
    if(_.isEmpty(findNode(relPath, _nodes))) {
        var pathParts = relPath.split("/");
        var indexOfLastPart = pathParts.length-1;
        var filename = pathParts[indexOfLastPart];
        _nodes.push({
            kennzeichen: filename,
            name: relPath,
            depth: depth,
            bundesland: (pathParts[0] == filename ? "." : pathParts[0])
        })
    }
}

function addLink(fromRelPath, toRelPath, value, _links) {
    if(_.isEmpty(findLink(fromRelPath, toRelPath, _links))) {
        _links.push({
            source: fromRelPath,
            target: toRelPath,
            count: value*100
        });
    }
}

function _getCoronaRecursive(fromRelPath, currentDepth, maxDepth, _nodes, _links, _processed) {
    _processed.push(fromRelPath);

    addNode(fromRelPath, currentDepth, _nodes);

    if(currentDepth < maxDepth) {
        var entry = index[fromRelPath];
        if(entry != null) {
            _.forOwn(entry, function (value, toRelPath) {
                var toRelPathWithoutSuffix = relPath.removeSuffix(toRelPath);
                addLink(fromRelPath, toRelPathWithoutSuffix, value, _links);
                updateDepth(toRelPathWithoutSuffix, currentDepth+1, _nodes);
                if(_processed.indexOf(toRelPathWithoutSuffix) < 0) {
                    _getCoronaRecursive(toRelPathWithoutSuffix, currentDepth+1, maxDepth, _nodes, _links, _processed);
                }
            })
        }
    }
}

function getCorona(relPath, maxDepth) {
    if(_.isEmpty(index)) {
        readIndex();
    }

    var _links = [];
    var _nodes = [];

    _getCoronaRecursive(relPath, 0, maxDepth, _nodes, _links, []);
    return {
        cities: _nodes,
        links: _links
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
