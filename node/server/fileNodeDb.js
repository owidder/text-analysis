var fs = require('fs');
var os = require('os');
var path = require('path');

var SimplePromise = require('./SimplePromise');
var tb = require('./trace');

var PATH = "./osm";

function prepare() {
    var $ = tb.in("fileNodeDb.prepare");

    if(!fs.existsSync(PATH)) {
        fs.mkdirSync(PATH);
    }

    tb.out($);
}

function getDbPath(id) {
    return PATH + "/" + id + ".json";
}

function serializeLinks(links) {
    var $ = tb.in("fileNodeDb.serializeLinks");

    var serializedLinks = links.map(function (link) {
        return ({
            sourceIndex: link.source.index,
            targetIndex: link.target.index,
            value: link.value,
            index: link.index
        })
    });

    tb.out($);
    return serializedLinks;
}

function deserializeLinks(serializedLinks, nodes) {
    var $ = tb.in("fileNodeDb.deserializeLinks");

    var deserializedLinks = serializedLinks.map(function (serializedLink) {
        return ({
            value: serializedLink.value,
            source: nodes[serializedLink.sourceIndex],
            target: nodes[serializedLink.targetIndex],
            index: serializedLink.index
        })
    });

    tb.out($);
    return deserializedLinks;
}

function prepareNodes(nodes) {
    var $ = tb.in("fileNodeDb.prepareNodes");

    var preparedNodes = nodes.map(function (node) {
        return ({
            index: node.index,
            name: node.name,
            shortName: node.shortName,
            x: node.x,
            y: node.y
        })
    });

    tb.out($);
    return preparedNodes;
}

function save(nodesLinksObj) {
    var $ = tb.in("fileNodeDb.save");

    var preparedNodes = prepareNodes(nodesLinksObj.nodes);
    var serializedLinks = serializeLinks(nodesLinksObj.links);

    var clob = JSON.stringify({
        nodes: preparedNodes,
        links: serializedLinks
    });

    var dbPath = getDbPath(nodesLinksObj._id);
    fs.writeFileSync(dbPath, clob);

    tb.out($);
}

function load(id) {
    var $ = tb.in("fileNodeDb.load");

    var dbPath = getDbPath(id);
    var clob = fs.readFileSync(dbPath);

    var nl = JSON.parse(clob);
    var deserializedLinks = deserializeLinks(nl.links, nl.nodes);

    tb.out($);

    return {
        nodes: nl.nodes,
        links: deserializedLinks
    };
}

function exist(id) {
    var $ = tb.in("fileNodeDb.exist");

    var dbPath = getDbPath(id);
    var _exist = fs.existsSync(dbPath);

    tb.out($);

    return _exist;
}

prepare();

module.exports = {
    save: save,
    load: load,
    exist: exist,
    serializeLinks: serializeLinks
};
