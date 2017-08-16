var fs = require('fs');
var os = require('os');
var path = require('path');

var SimplePromise = require('./SimplePromise');

var PATH = "./osm";

function prepare() {
    if(!fs.existsSync(PATH)) {
        fs.mkdirSync(PATH);
    }
}

function getDbPath(id) {
    return PATH + "/" + id + ".json";
}

function serializeLinks(links) {
    var serializedLinks = links.map(function (link) {
        return ({
            sourceIndex: link.source.index,
            targetIndex: link.target.index,
            value: link.value,
            index: link.index
        })
    });

    return serializedLinks;
}

function deserializeLinks(serializedLinks, nodes) {
    var deserializedLinks = serializedLinks.map(function (serializedLink) {
        return ({
            value: serializedLink.value,
            source: nodes[serializedLink.sourceIndex],
            target: nodes[serializedLink.targetIndex],
            index: serializedLink.index
        })
    });

    return deserializedLinks;
}

function prepareNodes(nodes) {
    var preparedNodes = nodes.map(function (node) {
        return ({
            index: node.index,
            name: node.name,
            shortName: node.shortName,
            x: node.x,
            y: node.y
        })
    });

    return preparedNodes;
}

function save(nodesLinksObj) {
    var preparedNodes = prepareNodes(nodesLinksObj.nodes);
    var serializedLinks = serializeLinks(nodesLinksObj.links);

    var clob = JSON.stringify({
        nodes: preparedNodes,
        links: serializedLinks
    });

    var dbPath = getDbPath(nodesLinksObj._id);
    fs.writeFileSync(dbPath, clob);
}

function load(id) {
    var dbPath = getDbPath(id);
    var clob = fs.readFileSync(dbPath);

    var nl = JSON.parse(clob);
    var deserializedLinks = deserializeLinks(nl.links, nl.nodes);

    return {
        nodes: nl.nodes,
        links: deserializedLinks
    };
}

function exist(id) {
    var dbPath = getDbPath(id);
    return fs.existsSync(dbPath);
}

prepare();

module.exports = {
    save: save,
    load: load,
    exist: exist,
    serializeLinks: serializeLinks
};
