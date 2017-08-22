'use strict';

/* global $ */
/* global d3 */

bottle.factory("BirdsviewRenderer", function (container) {

    var WAIT_TIME = 180000;
    var TICK_TIME = 1000;

    var SimplePromise = container.SimplePromise;
    var proxy = container.proxy;
    var Stream = container.Stream;

    function BirdsviewRenderer(birdsviewId, width, height, threshold, forceRefresh, extra) {

        var id;
        var readyPromise = new SimplePromise();
        var drawnPromise = new SimplePromise();

        function drawBorder(svg) {
            var svg = d3.select("#" + birdsviewId + " svg");
            svg.append("line")
                .attr("class", "svgborder")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", width)
                .attr("y2", 0);

            svg.append("line")
                .attr("class", "svgborder")
                .attr("x1", width)
                .attr("y1", 0)
                .attr("x2", width)
                .attr("y2", height);

            svg.append("line")
                .attr("class", "svgborder")
                .attr("x1", width)
                .attr("y1", height)
                .attr("x2", 0)
                .attr("y2", height);

            svg.append("line")
                .attr("class", "svgborder")
                .attr("x1", 0)
                .attr("y1", height)
                .attr("x2", 0)
                .attr("y2", 0);
        }

        function drawBirdsViewFromSvgString(svgString) {
            var bv = $("#" + birdsviewId);
            bv.empty();
            bv.append(svgString);
            drawBorder();
        }

        function stopAndDraw(forceId) {
            proxy.stop(forceId).then(function () {
                draw(forceId);
                readyPromise.resolve(id);
            });
        }

        var timerReady = false;
        function readStreamAndDraw(forceId) {
            var stream = new Stream(function () {
                return proxy.nextSvgChunk(forceId);
            });

            stream.isReady().then(function (svgString) {
                drawBirdsViewFromSvgString(svgString);
                if(timerReady) {
                    proxy.stop(forceId).then(function () {
                        extra.progressChangedCallback && extra.progressChangedCallback(100);
                        readyPromise.resolve(id);
                    });
                }
                else {
                    setTimeout(function () {
                        readStreamAndDraw(forceId);
                    })
                }
            });
        }

        function draw(forceId) {
            var p = new SimplePromise();

            proxy.getSvg(forceId).then(function (svgStringObj) {
                drawBirdsViewFromSvgString(svgStringObj.svg);
                p.resolve();
            });

            return p.promise;
        }

        function doTicks() {
            if(extra.progressChangedCallback) {
                var ctr = 0;
                return setInterval(function () {
                    extra.progressChangedCallback(ctr / WAIT_TIME * 100);
                    ctr += TICK_TIME;
                }, TICK_TIME);
            }
        }

        function start() {
            extra.loadStartedCallback && extra.loadStartedCallback();
            proxy.start(width, height, threshold, forceRefresh).then(function (result) {
                id = result.id;
                extra.loadEndedCallback && extra.loadEndedCallback();
                timerReady = true;
                if (result.loaded) {
                    readStreamAndDraw(result.id);
                }
                else {
                    var interval = doTicks();
                    setTimeout(function () {
                        clearInterval(interval);
                        readStreamAndDraw(result.id);
                    }, WAIT_TIME);
                }
            });
        }

        this.ready = function() {
            return readyPromise.promise;
        };

        drawnPromise.promise.then(function () {
            var svg = d3.select("#" + birdsviewId + " svg");
            drawBorder(svg);
        });

        start();
    }

    return BirdsviewRenderer;

});