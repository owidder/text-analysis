var Force = require('./Force');
var Stream = require('./Stream');
var tb = require('./trace');

var forceContextArray = [];

function start(width, height, threshold, forceRefresh) {
    tb.in();

    var forceId = forceContextArray.length;
    var force = new Force(forceId, width, height, forceRefresh);
    var startResult = force.start(threshold);
    forceContextArray.push({
        force: force
    });

    setTimeout(function () {
        remove(forceId);
    }, 3600e+3);

    tb.out();
    return {
        id: forceId,
        loaded: startResult.loaded
    };
}

function getSvg(forceId) {
    tb.in();

    var svg = forceContextArray[forceId].force.getSvg();

    tb.out();
    return svg;
}

function nextSvgChunk(forceId, zipped) {
    tb.in();

    var forceContext = forceContextArray[forceId];
    if(!forceContext.svgStream) {
        forceContext.svgStream = new Stream(function () {
            return forceContext.force.getSvg();
        }, 1e+6, zipped);
    }
    var nextChunk = forceContext.svgStream.nextChunk();

    tb.out();
    return nextChunk;
}

function getNodesAndLinks(forceId) {
    tb.in();

    var nodesAndLinks = forceContextArray[Number(forceId)].getNodesAndLinks();

    tb.out();
    return nodesAndLinks;
}

function nextNodesAndLinksChunk(forceId, zipped) {
    tb.in();

    var forceContext = forceContextArray[forceId];
    if(!forceContext.nodesAndLinksStream) {
        forceContext.nodesAndLinksStream = new Stream(function () {
            var nodesAndLinks = forceContext.force.getNodesAndLinks();
            return JSON.stringify(nodesAndLinks);
        }, 1e+7, zipped);
    }
    var nextChunk = forceContext.nodesAndLinksStream.nextChunk();

    tb.out();
    return nextChunk;
}

function stop(forceId) {
    tb.in();
    var ret = forceContextArray[forceId].force.stop();

    tb.out();
    return ret;
}

function remove(forceId) {
    tb.in();

    forceContextArray[forceId] = undefined;

    tb.out();
}

module.exports = {
    start: start,
    stop: stop,
    getSvg: getSvg,
    getNodesAndLinks: getNodesAndLinks,
    remove: remove,
    nextSvgChunk: nextSvgChunk,
    nextNodesAndLinksChunk: nextNodesAndLinksChunk
};
