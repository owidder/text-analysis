'use strict';

/* global $ */
/* global d3 */

bottle.factory("BirdsviewRenderer", function (container) {

    var SimplePromise = container.SimplePromise;
    var proxy = container.proxy;

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

        function waitAndDraw(id) {
            wait(30, function () {
                return draw(id);
            }).then(function () {
                stopAndDraw(id);
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

        function wait(maxTicks, funcDoEachTick) {
            var p = new SimplePromise();

            function waitOneTickOrStop(tickCtr) {
                if(tickCtr > maxTicks) {
                    p.resolve();
                }
                else {
                    if(extra.progressChangedCallback) {
                        extra.progressChangedCallback(tickCtr/maxTicks*100);
                    }
                    funcDoEachTick().then(function () {
                        setTimeout(function () {
                            waitOneTickOrStop(tickCtr+1);
                        }, 2000);
                    });
                }
            }

            waitOneTickOrStop(0);

            return p.promise;
        }

        function start() {
            extra.loadStartedCallback && extra.loadStartedCallback();
            proxy.start(width, height, threshold, forceRefresh).then(function (result) {
                id = result.id;
                extra.loadEndedCallback && extra.loadEndedCallback();
                if (result.loaded) {
                    extra.progressChangedCallback && extra.progressChangedCallback(100);
                    draw(result.id);
                    readyPromise.resolve(result.id);
                }
                else {
                    waitAndDraw(result.id);
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