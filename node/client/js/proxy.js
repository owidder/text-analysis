'use strict';

bottle.factory("proxy", function (container) {

    var SimplePromise = container.SimplePromise;

    function callServer(type, path, data) {
        var p = new SimplePromise();

        var callObj = {
            type: type,
            url: "/api" + path,
            success: function (response) {
                p.resolve(response);
            }
        };

        if(data) {
            callObj.data = data;
        }

        $.ajax(callObj);

        return p.promise;
    }

    function getWordList(relPath) {
        return callServer("GET", "/values/file/" + relPath);
    }

    function getNodesAndLinks(forceId) {
        return callServer("GET", "/getNodesAndLinks/" + forceId);
    }

    function start(width, height, threshold, forceRefresh) {
        return callServer("POST", "/start", {
            width: width,
            height: height,
            threshold: threshold,
            forceRefresh: forceRefresh
        });
    }
    
    function getSvg(forceId) {
        return callServer("GET", "/getSvg/" + forceId);
    }

    function nextSvgChunk(forceId) {
        return callServer("GET", "/nextSvgChunk/" + forceId);
    }

    function nextNodesAndLinksChunk(forceId) {
        return callServer("GET", "/nextNodesAndLinksChunk/" + forceId);
    }

    function stop(forceId) {
        return callServer("POST", "/stop/" + forceId);
    }

    function remove(forceId) {
        return callServer("POST", "/remove/" + forceId);
    }

    return {
        getNodesAndLinks: getNodesAndLinks,
        start: start,
        getSvg: getSvg,
        stop: stop,
        remove: remove,
        getWordList: getWordList,
        nextSvgChunk: nextSvgChunk,
        nextNodesAndLinksChunk: nextNodesAndLinksChunk
    }
});