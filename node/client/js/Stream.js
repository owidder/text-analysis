'use strict';

/* global bottle */
/* global _ */
/* global pako */

bottle.factory("Stream", function (container) {
    var SimplePromise = container.SimplePromise;

    function addCharCodeArrayToString(charCodeArray, stringToAddTo) {
        var i, BLOCK_SIZE = 1e+4;
        for(i = 0; i < charCodeArray.length; i += BLOCK_SIZE) {
            stringToAddTo += String.fromCharCode.apply(undefined, charCodeArray.slice(i, i + BLOCK_SIZE));
        }

        return stringToAddTo;
    }

    function Stream(receiveChunkFunction) {

        var content;
        var ready;

        function receive() {
            receiveChunkFunction().then(function (response) {
                var chunkZippedBytes, chunkUnzippedCharCodeArray;
                if(response.zippedChunk) {
                    chunkZippedBytes = atob(response.zippedChunk);
                    chunkUnzippedCharCodeArray = pako.ungzip(chunkZippedBytes);
                    content = addCharCodeArrayToString(chunkUnzippedCharCodeArray, content);
                }
                else {
                    content += response.unzippedChunk;
                }

                if(response.last) {
                    ready.resolve(content);
                }
                else {
                    setTimeout(receive);
                }
            });
        }

        function start() {
            content = "";
            ready = new SimplePromise();
            receive();
        }

        this.isReady = function() {
            return ready.promise;
        };

        start();
    }

    return Stream;
});
