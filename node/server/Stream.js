var _ = require('lodash');
var zlib = require('zlib');

var DEFAULT_CHUNK_SIZE = 100000;

function Stream(getContentFunc, chunkSize, zipped) {
    if(!chunkSize) {
        chunkSize = DEFAULT_CHUNK_SIZE;
    }

    var content;
    var offset;

    function nextChunk() {

        if(_.isEmpty(content)) {
            content = getContentFunc();
            offset = 0;
        }

        var chunk = "";
        var last = false;
        if(offset < content.length-1) {
            chunk = content.substr(offset, chunkSize);
            offset += chunkSize;
            if(offset >= content.length) {
                last = true;
                content = undefined;
            }
        }
        else {
            last = true;
            content = undefined;
        }

        if(zipped) {
            return {
                zippedChunk: zlib.gzipSync(chunk).toString('base64'),
                last: last
            };
        }
        else {
            return {
                unzippedChunk: chunk,
                last: last
            }
        }

    }

    this.nextChunk = nextChunk;
}

module.exports = Stream;
