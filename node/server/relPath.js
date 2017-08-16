'use strict';

var BASE_PATH = '/Users/owidder/dev/iteragit/nge/python/OpenSpeedMonitor/';
var SUFFIX = ".utf8";

function removeBasePath(absPath) {
    return absPath.substr(BASE_PATH.length);
}

function removeSuffix(name) {
    return name.substr(0, name.length - SUFFIX.length);
}

function makeRelPath(path) {
    return removeSuffix(removeBasePath(path));
}

module.exports = {
    removeBasePath: removeBasePath,
    removeSuffix: removeSuffix,
    makeRelPath: makeRelPath
};
