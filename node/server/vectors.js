'use strict';

var fs = require('fs');
var _ = require('lodash');
var math = require('mathjs');
var os = require('os');

var _relPath = require('./relPath');
var util = require('./util');

var VECTORS_FILE_PATH = '../python/python-lsi/data/vectors.csv';
var FILENAMES_FILE_PATH = '../python/python-lsi/data/filenames.csv';
var CLOUD_FILE_PATH = '../python/python-lsi/data/whole_cloud.csv';

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

function computeCosineBetweenVectors(vector1, vector2) {
    var cosine = math.multiply(vector1, vector2) / (math.norm(vector1) * math.norm(vector2));
    return cosine;
}

function getAllFilesWithCosineBetween(fileRelPath, cosineLower, cosineUpper) {
    if(_.isEmpty(vectors)) {
        readVectors();
    }

    var ownVec = getVectorForFile(fileRelPath);
    var data = [];
    _.forOwn(vectors, function (vector, relPath) {
        if(relPath != fileRelPath && !_.isEmpty(relPath) && vector.length == ownVec.length) {
            var cosine = computeCosineBetweenVectors(ownVec, vector);
            if(cosine >= cosineLower && cosine < cosineUpper) {
                data.push({
                    relPath: relPath,
                    cosine: math.round(cosine, 3)
                });
            }
        }
    });

    return data.sort(function (a, b) {
        return util.compare(a.cosine, b.cosine) * -1;
    });
}

function createHistoDataForFile(fileRelPath) {
    if(_.isEmpty(vectors)) {
        readVectors();
    }

    var ownVec = getVectorForFile(fileRelPath);
    var data = [];
    _.forOwn(vectors, function (vector, relPath) {
        if(relPath != fileRelPath && !_.isEmpty(relPath) && vector.length == ownVec.length) {
            var cosine = computeCosineBetweenVectors(ownVec, vector);
            data.push(cosine);
        }
    });

    return data;
}

function addToNodes(relPath, nodes) {
    var existingNode = nodes.find(util.findFunc("name", relPath));
    if(_.isEmpty(existingNode)) {
        var shortName = relPath.split("/").slice(-1)[0];
        nodes.push({
            name: relPath,
            shortName: shortName
        });
    }
}

function addToLinks(fromRelPath, toRelPath, cos, links) {
    links.push({
        source: fromRelPath,
        target: toRelPath,
        value: cos*100
    });
}

function processCloudLine(line, links, fromRelPath, relPaths, threshold) {
    var parts = line.split("\t");
    var i, index, value, toRelPath;
    if(parts.length > 1) {
        for(i = 0; i < parts.length; i += 2) {
            index = parts[i];
            value = parts[i+1];
            toRelPath = relPaths[index];
            if(value > threshold) {
                addToLinks(fromRelPath, toRelPath, value, links);
            }
        }
    }
}

function readRelPaths(nodes) {
    var content = fs.readFileSync(FILENAMES_FILE_PATH, 'utf8');
    var filenames = content.split(os.EOL);
    var relPaths = filenames.map(_relPath.makeRelPath);
    relPaths.forEach(function (fromRelPath) {
        addToNodes(fromRelPath, nodes);
    });

    return relPaths;
}

function readCosines(links, relPaths, threshold) {
    var content = fs.readFileSync(CLOUD_FILE_PATH, 'utf8');
    var lines = content.split(os.EOL);
    lines.forEach(function (line, index) {
        var fromRelPath = relPaths[index];
        processCloudLine(line, links, fromRelPath, relPaths, threshold);
    });
}

function readTheCloud(threshold) {
    var nodes = [];
    var links = [];
    var relPaths = readRelPaths(nodes);
    readCosines(links, relPaths, threshold);

    return {
        nodes: nodes,
        links: links
    }
}

function theWholeCloud(minCount) {
    if(_.isEmpty(vectors)) {
        readVectors();
    }

    var allLinks = [];
    var allNodes = [];

    var relPaths = _.keys(vectors);
    var i, j;

    for(i = 0; i < relPaths.length - 1; i++) {
        if(i%10 == 0) {
            console.log(i + " - " + allNodes.length);
        }
        var fromRelPath = relPaths[i];
        var fromVec = vectors[fromRelPath];
        for(j = i + 1; j < relPaths.length; j++) {
            var toRelPath = relPaths[j];
            var toVec = vectors[toRelPath];
            if(!_.isEmpty(fromRelPath) && !_.isEmpty(toRelPath) && fromVec.length == toVec.length) {
                var cos = computeCosineBetweenVectors(fromVec, toVec);
                if(cos > .5) {
                    addToNodes(fromRelPath, allNodes);
                    addToNodes(toRelPath, allNodes);
                    addToLinks(fromRelPath, toRelPath, cos, allLinks);
                    if(allNodes.length >= minCount) {
                        return {
                            nodes: allNodes,
                            links: allLinks
                        }
                    }
                }
            }
        }
    }

    return {
        nodes: allNodes,
        links: allLinks
    }
}

module.exports = {
    createHistoDataForFile: createHistoDataForFile,
    getAllFilesWithCosineBetween: getAllFilesWithCosineBetween,
    theWholeCloud: theWholeCloud,
    readTheCloud: readTheCloud
};
