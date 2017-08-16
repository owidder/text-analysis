'use strict';

/* global bottle */

bottle.factory("ZoomArea", function (container) {
    var Legend = container.Legend;
    var SimplePromise = container.SimplePromise;

    function ZoomArea(svgId, width, height, clickCallBack, mouseMovedCallBack, mouseOutCallBack) {
        var zoomCenterX = width/2;
        var zoomCenterY = height/2;
        var firstDrawPromise = new SimplePromise();

        firstDrawPromise.promise.then(function () {
            legend.appendLegend();
        });

        var svg = d3.select("#" + svgId).append("svg")
            .attr("class", "zoom")
            .attr("width", width*3)
            .attr("height", height*5)
            .on("click", function () {
                if(legend) {
                    var evt = d3.mouse(this);
                    var legendList = legend.createLegendListAtPos(evt[0], evt[1]);
                    clickCallBack(legendList);
                }
            })
            .on("mousemove", function () {
                if(legend) {
                    var evt = d3.mouse(this);
                    var legendList = legend.mouseMoved(evt[0], evt[1]);
                    if(_.isEmpty(legendList)) {
                        mouseOutCallBack && mouseOutCallBack();
                    }
                    else {
                        mouseMovedCallBack && mouseMovedCallBack(legendList);
                    }
                }
            })
            .on("mouseout", function () {
                if(legend) {
                    legend.hideLegend();
                }
                mouseOutCallBack && mouseOutCallBack();
            });

        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);

        var linksG = svg.append("g");
        var nodesG = svg.append("g");
        var zoomLinesG = svg.append("g");
        var borderG = svg.append("g");
        var legendG = svg.append("g");

        var legend = new Legend("svg.zoom", 10, legendG);

        zoomLinesG.append("g")
            .attr("class", "guidelines")
            .append("line")
            .attr("stroke-dasharray", "5,5")
            .attr("class", "guideline")
            .attr("x1", 0)
            .attr("y1", height/2)
            .attr("x2", width)
            .attr("y2", height/2);

        zoomLinesG.append("g")
            .attr("class", "guidelines")
            .append("line")
            .attr("class", "guideline")
            .attr("stroke-dasharray", "5,5")
            .attr("x1", width/2)
            .attr("y1", 0)
            .attr("x2", width/2)
            .attr("y1", height);

        borderG.append("line")
            .attr("class", "svgborder")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", width)
            .attr("y2", 0);

        borderG.append("line")
            .attr("class", "svgborder")
            .attr("x1", width)
            .attr("y1", 0)
            .attr("x2", width)
            .attr("y2", height);

        borderG.append("line")
            .attr("class", "svgborder")
            .attr("x1", width)
            .attr("y1", height)
            .attr("x2", 0)
            .attr("y2", height);

        borderG.append("line")
            .attr("class", "svgborder")
            .attr("x1", 0)
            .attr("y1", height)
            .attr("x2", 0)
            .attr("y2", 0);

        function zx(x, zoomX, zoomFactor) {
            var diffX = x - zoomX;
            return zoomCenterX + diffX*zoomFactor;
        }

        function zy(y, zoomY, zoomFactor) {
            var diffY = y - zoomY;
            return zoomCenterY + diffY*zoomFactor;
        }

        var radiusFactor = 1;
        var showLinks = false;
        var lastNodes, lastLinks, lastX, lastY, lastZoomFactor;

        function drawLinks(links, x, y, zoomFactor) {
            var linksWithData = linksG.selectAll("line.link")
                .data(links, function (d) {
                    return d.source.name + "-" + d.target.name;
                });

            var linksCircleStartWithData = linksG.selectAll("circle.linkstart")
                .data(links, function (d) {
                    return d.source.name + "-" + d.target.name;
                });

            var linksCircleEndWithData = linksG.selectAll("circle.linkend")
                .data(links, function (d) {
                    return d.source.name + "-" + d.target.name;
                });

            linksWithData.enter()
                .append("line")
                .attr("class", "link zoom")
                .attr("clip-path", "url(#clip)");

            linksCircleStartWithData.enter()
                .append("circle")
                .attr("r", 1)
                .attr("class", "linkstart")
                .attr("clip-path", "url(#clip)");

            linksCircleEndWithData.enter()
                .append("circle")
                .attr("r", 1)
                .attr("class", "linkend")
                .attr("clip-path", "url(#clip)");

            linksG.selectAll("line.link")
                .attr("style", function (d) {
                    return "opacity: " + ((d.value / 100) * .2) + ";"
                })
                .attr("x1", function (d) {
                    return zx(d.source.pcx, x, zoomFactor);
                })
                .attr("y1", function (d) {
                    return zy(d.source.pcy, y, zoomFactor);
                })
                .attr("x2", function (d) {
                    return zx(d.target.pcx, x, zoomFactor)
                })
                .attr("y2", function (d) {
                    return zy(d.target.pcy, y, zoomFactor);
                });

            linksG.selectAll("circle.linkstart")
                .attr("cx", function (d) {
                    return zx(d.source.pcx, x, zoomFactor);

                })
                .attr("cy", function (d) {
                    return zy(d.source.pcy, y, zoomFactor);
                });

            linksG.selectAll("circle.linkend")
                .attr("cx", function (d) {
                    return zx(d.target.pcx, x, zoomFactor)
                })
                .attr("cy", function (d) {
                    return zy(d.target.pcy, y, zoomFactor);
                });

            linksWithData.exit().remove();
            linksCircleStartWithData.exit().remove();
            linksCircleEndWithData.exit().remove();
        }

        function drawNodes(nodes, x, y, zoomFactor) {
            var nodesWithData = nodesG.selectAll("circle.node")
                .data(nodes, function (d) {
                    return d.name;
                });

            nodesWithData.enter()
                .append("circle")
                .attr("class", "node forlegend zoom")
                .attr("_legend", function (d) {
                    return d.name;
                })
                .attr("fill", function (d) {
                    return d.color;
                })
                .attr("clip-path", "url(#clip)");

            nodesG.selectAll("circle.node")
                .attr("r", zoomFactor * radiusFactor)
                .attr("cx", function (d) {
                    return zx(d.pcx, x, zoomFactor);
                })
                .attr("cy", function (d) {
                    return zy(d.pcy, y, zoomFactor);
                });

            nodesWithData.exit().remove();

            firstDrawPromise.resolve();
        }

        function draw(nodes, links, x, y, zoomFactor) {
            lastNodes = nodes;
            lastLinks = links;
            lastX = x;
            lastY = y;
            lastZoomFactor = zoomFactor;

            drawNodes(nodes, x, y, zoomFactor);
            if(showLinks) {
                drawLinks(links, x, y, zoomFactor);
            }
            else {
                drawLinks([], x, y, zoomFactor);
            }
        }

        function redraw() {
            if(lastNodes) {
                draw(lastNodes, lastLinks, lastX, lastY, lastZoomFactor);
            }
        }

        this.draw = draw;

        this.changeRadiusFactor = function (_radiusFactor) {
            radiusFactor = _radiusFactor;
            redraw();
        };

        this.changeShowLinks = function (_showLinks) {
            showLinks = _showLinks;
            redraw();
        }
    }

    return ZoomArea;
});