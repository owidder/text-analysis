var Force = require('./Force');
var Stream = require('./Stream');

var forceContextArray = [];

function start(width, height, threshold, forceRefresh) {
    var forceId = forceContextArray.length;
    var force = new Force(forceId, width, height, forceRefresh);
    var startResult = force.start(threshold);
    forceContextArray.push({
        force: force
    });

    setTimeout(function () {
        remove(forceId);
    }, 3600e+3);

    return {
        id: forceId,
        loaded: startResult.loaded
    };
}

function getSvg(forceId) {
    return forceContextArray[forceId].force.getSvg();
}

function nextSvgChunk(forceId, zipped) {
    var forceContext = forceContextArray[forceId];
    if(!forceContext.svgStream) {
        forceContext.svgStream = new Stream(function () {
            return forceContext.force.getSvg();
        }, 1e+7, zipped);
    }
    return forceContext.svgStream.nextChunk();
}

function getNodesAndLinks(forceId) {
    return forceContextArray[Number(forceId)].getNodesAndLinks();
}

function nextNodesAndLinksChunk(forceId, zipped) {
    var forceContext = forceContextArray[forceId];
    if(!forceContext.nodesAndLinksStream) {
        forceContext.nodesAndLinksStream = new Stream(function () {
            var nodesAndLinks = forceContext.force.getNodesAndLinks();
            return JSON.stringify(nodesAndLinks);
        }, 1e+7, zipped);
    }
    return forceContext.nodesAndLinksStream.nextChunk();
}

function stop(forceId) {
    return forceContextArray[forceId].force.stop();
}

function remove(forceId) {
    forceContextArray[forceId] = undefined;
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
