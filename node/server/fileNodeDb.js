var fs = require('fs');
var os = require('os');
var path = require('path');

var SimplePromise = require('./SimplePromise');
var tb = require('./trace');

var PATH = "./osm";

function prepare() {
    tb.in();

    if(!fs.existsSync(PATH)) {
        fs.mkdirSync(PATH);
    }

    tb.out();
}

function getDbPath(id) {
    return PATH + "/" + id + ".json";
}

function serializeLinks(links) {
    tb.in();

    var serializedLinks = links.map(function (link) {
        return ({
            sourceIndex: link.source.index,
            targetIndex: link.target.index,
            value: link.value,
            index: link.index
        })
    });

    tb.out();
    return serializedLinks;
}

function deserializeLinks(serializedLinks, nodes) {
    tb.in();

    var deserializedLinks = serializedLinks.map(function (serializedLink) {
        return ({
            value: serializedLink.value,
            source: nodes[serializedLink.sourceIndex],
            target: nodes[serializedLink.targetIndex],
            index: serializedLink.index
        })
    });

    tb.out();
    return deserializedLinks;
}

function prepareNodes(nodes) {
    tb.in();

    var preparedNodes = nodes.map(function (node) {
        return ({
            index: node.index,
            name: node.name,
            shortName: node.shortName,
            x: node.x,
            y: node.y
        })
    });

    tb.out();
    return preparedNodes;
}

function save(nodesLinksObj) {
    tb.in();

    var preparedNodes = prepareNodes(nodesLinksObj.nodes);
    var serializedLinks = serializeLinks(nodesLinksObj.links);

    var clob = JSON.stringify({
        nodes: preparedNodes,
        links: serializedLinks
    });

    var dbPath = getDbPath(nodesLinksObj._id);
    fs.writeFileSync(dbPath, clob);

    tb.out();
}

function load(id) {
    tb.in();

    var dbPath = getDbPath(id);
    var clob = fs.readFileSync(dbPath);

    var nl = JSON.parse(clob);
    var deserializedLinks = deserializeLinks(nl.links, nl.nodes);

    tb.out();

    return {
        nodes: nl.nodes,
        links: deserializedLinks
    };
}

function exist(id) {
    tb.in("fileNodeDb.exist");

    var dbPath = getDbPath(id);
    var _exist = fs.existsSync(dbPath);

    tb.out();

    return _exist;
}

prepare();

module.exports = {
    save: save,
    load: load,
    exist: exist,
    serializeLinks: serializeLinks
};
