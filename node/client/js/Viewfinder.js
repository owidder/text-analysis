'use strict';

/* global bottle */

bottle.factory("Viewfinder", function (container) {

    var NODE_ID_PREFIX = "node-";
    var WIDTH_EXTRA = 20;
    var HEIGHT_EXTRA = 20;
    var MAX_LINKS = 10000;


    function Viewfinder(svg, nodes, totalWidth, totalHeight, viewfinderChangedCallback, extra) {

        var moveMode = false;
        var position = {
            x: totalWidth/2,
            y: totalHeight/2
        };
        var factor = 0.1;
        var viewfinderrect = svg.node().createSVGRect();

        function updateViewfinderRect(x, y, width, height) {
            viewfinderrect.x = x - width/2;
            viewfinderrect.y = y - height/2;
            viewfinderrect.width = width;
            viewfinderrect.height = height;
        }

        function computeNodeList() {
            var elementList = svg.node().getIntersectionList(viewfinderrect, null);
            var nodeList = [];
            elementList.forEach(function (element) {
                if(element.id.startsWith(NODE_ID_PREFIX)) {
                    var index = Number(element.id.substr(NODE_ID_PREFIX.length));
                    var node = nodes[index];
                    nodeList.push(node);
                }
            });

            return nodeList;
        }

        function countLinkCategories(nodeList, links) {
            var innerLinkCount = 0;
            var inoutGoingLinkCount = 0;

            links.forEach(function (link) {
                if(nodeList.indexOf(link.source) >= 0 && nodeList.indexOf(link.target) >= 0) {
                    innerLinkCount++;
                }
                else  {
                    inoutGoingLinkCount++;
                }
            });

            return {
                inner: innerLinkCount,
                inoutgoing: inoutGoingLinkCount
            }
        }

        function fillLinksWithNodeListAllSourceLinks(nodeList, links) {
            nodeList.forEach(function (node) {
                if(!_.isEmpty(node.sourceLinks)) {
                    Array.prototype.push.apply(links, node.sourceLinks);
                    if(links.length > MAX_LINKS) {
                        throw ("> " + MAX_LINKS);
                    }
                }
            });
        }

        function fillLinksWithNodeListMissingTargetLinks(nodeList, links) {
            nodeList.forEach(function (node) {
                if(!_.isEmpty(node.targetLinks)) {
                    node.targetLinks.forEach(function (link) {
                        if(links.indexOf(link) < 0) {
                            links.push(link);
                            if(links.length > MAX_LINKS) {
                                throw ("> " + MAX_LINKS);
                            }
                        }
                    });
                }
            });
        }

        function getLinksFromNodeList(nodeList) {
            var links = [];

            try {
                fillLinksWithNodeListAllSourceLinks(nodeList, links);
                fillLinksWithNodeListMissingTargetLinks(nodeList, links);
            } catch (e) {
                links.length = 0;
                links.tooBig = true;
                links.message = e;
            }

            return links;
        }

        function drawViewfinder() {
            viewfinderG.attr("class", moveMode ? "move" : "no-move");

            viewfinderG.selectAll("rect.viewfinder")
                .data([viewfinderrect])
                .enter()
                .append("rect")
                .attr("class", "viewfinder");

            viewfinderG.selectAll("line.viewfinder.h")
                .data([viewfinderrect])
                .enter()
                .append("line")
                .attr("class", "viewfinder h");

            viewfinderG.selectAll("line.viewfinder.v")
                .data([viewfinderrect])
                .enter()
                .append("line")
                .attr("class", "viewfinder v");

            viewfinderG.selectAll("rect.viewfinder")
                .attr("x", viewfinderrect.x)
                .attr("y", viewfinderrect.y)
                .attr("width", viewfinderrect.width)
                .attr("height", viewfinderrect.height);

            var viewfinderCenterX = viewfinderrect.x + viewfinderrect.width/2;
            var viewfinderCenterY = viewfinderrect.y + viewfinderrect.height/2;

            viewfinderG.selectAll("line.viewfinder.h")
                .attr("x1", "0")
                .attr("y1", viewfinderCenterY)
                .attr("x2", totalWidth + WIDTH_EXTRA)
                .attr("y2", viewfinderCenterY);

            viewfinderG.selectAll("line.viewfinder.v")
                .attr("x1", viewfinderCenterX)
                .attr("y1", 0)
                .attr("x2", viewfinderCenterX)
                .attr("y2", totalHeight + HEIGHT_EXTRA);
        }

        function mouseMoved(evt) {
            if(moveMode) {
                d3.event.preventDefault();
                position.x = evt[0];
                position.y = evt[1];

                refresh();
            }
        }

        function clicked(evt) {
            if(!moveMode) {
                var x = evt[0];
                var y = evt[1];

                extra.relPositionChangedCallback && extra.relPositionChangedCallback({
                    relX: x/totalWidth,
                    relY: y/totalHeight
                });
            }
            else {
                mouseMoved(evt);
            }
            refresh({});
        }

        function refresh() {
            var width = (totalWidth + WIDTH_EXTRA) * factor;
            var height = (totalHeight + HEIGHT_EXTRA) * factor;

            updateViewfinderRect(position.x, position.y, width, height);
            var nodeList = computeNodeList(position.x, position.y, width, height);
            var noOfNodes = nodeList.length;
            var linksFromNodeList = getLinksFromNodeList(nodeList);
            var noOfLinks = linksFromNodeList.tooBig ? linksFromNodeList.message : linksFromNodeList.length;
            var categoryCount;
            if(linksFromNodeList.tooBig) {
                categoryCount = {
                    inner: "?",
                    inoutgoing: "?"
                }
            }
            else {
                categoryCount = countLinkCategories(nodeList, linksFromNodeList);
            }

            extra.numberOfLinksCallback && extra.numberOfLinksCallback(noOfLinks);
            extra.numberOfNodesCallback && extra.numberOfNodesCallback(noOfNodes);
            extra.numberOfInnerLinksCallback && extra.numberOfInnerLinksCallback(categoryCount.inner);
            extra.numberOfInoutGoingLinksCallback && extra.numberOfInoutGoingLinksCallback(categoryCount.inoutgoing);

            drawViewfinder();
            viewfinderChangedCallback(nodeList, linksFromNodeList, position.x, position.y, factor);
        }

        this.setPosition = function(x, y) {
            position.x = x;
            position.y = y;
            refresh();
        };
        
        this.setRelPosition = function (relPosition) {
            position.x = relPosition.relX * totalWidth;
            position.y = relPosition.relY * totalHeight;
            refresh();
        };

        this.setFactor = function(_factor) {
            factor = _factor;
            refresh();
        };

        var viewfinderG = svg.append("g");

        svg
            .on("click", function () {
                moveMode = !moveMode;
                clicked(d3.mouse(this));
            })
            .on("mousemove", function () {
                mouseMoved(d3.mouse(this));
            });

        refresh();
    }

    return Viewfinder;

});