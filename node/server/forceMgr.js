var Force = require('./Force');

var forceArray = [];

function start(width, height, threshold, forceRefresh) {
    var forceId = forceArray.length;
    var force = new Force(forceId, width, height, forceRefresh);
    var startResult = force.start(threshold);
    forceArray.push(force);

    return {
        id: forceId,
        loaded: startResult.loaded
    };
}

function getSvg(forceId) {
    return forceArray[Number(forceId)].getSvg();
}

function getNodesAndLinks(forceId) {
    return forceArray[Number(forceId)].getNodesAndLinks();
}

function stop(forceId) {
    return forceArray[Number(forceId)].stop();
}

function remove(forceId) {
    forceArray.splice(forceId, 1);
}

module.exports = {
    start: start,
    stop: stop,
    getSvg: getSvg,
    getNodesAndLinks: getNodesAndLinks,
    remove: remove
};
