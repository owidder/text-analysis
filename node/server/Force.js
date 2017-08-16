var D3Node = require('d3-node');
var fs = require('fs');
var _ = require('lodash');

var vector = require('./vectors');
var fileNodeDb = require('./fileNodeDb');
var SimplePromise = require('./SimplePromise');

var Force = function (id, width, height, forceRefresh) {

    var tickCtr = 0;
    var d3n = new D3Node();
    var d3 = d3n.d3;

    var nodes;
    var links;
    var currentSvg;
    var threshold;

    var svg = d3n.createSVG(width, height);
    var circlesG = svg.append("g")
        .attr("class", "circles");

    function start(_threshold) {
        threshold = _threshold;

        var loaded;

        var fileId = getFileId();
        if(_.isEmpty(forceRefresh) && fileNodeDb.exist(fileId)) {
            loaded = true;
            var nodesLinksObj = fileNodeDb.load(fileId);
            nodes = denormalizeNodes(nodesLinksObj.nodes);
            links = nodesLinksObj.links;
            drawNodes();
            ticked();
        }
        else {
            loaded = false;
            var cloud = vector.readTheCloud(_threshold);
            nodes = cloud.nodes;
            links = cloud.links;

            drawNodes();
            startForce();
        }

        return ({
            loaded: loaded
        })
    }

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    function colorForNodeName(name) {
        var parts = name.split(".");
        var type = parts[parts.length-1];
        return color(type);
    }

    function getDimensions() {
        var minX = Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxX = -Number.MAX_VALUE;
        var maxY = -Number.MAX_VALUE;

        nodes.forEach(function (d) {
            if(d.x < minX) {
                minX = d.x;
            }
            if(d.y < minY) {
                minY = d.y;
            }
            if(d.x > maxX) {
                maxX = d.x;
            }
            if(d.y > maxY) {
                maxY = d.y;
            }
        });

        return {
            width: maxX - minX,
            height: maxY - minY,
            maxX: maxX,
            maxY: maxY,
            minX: minX,
            minY: minY
        }
    }

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.name;
        }).distance(function (d) {
            return -d.value;
        }))
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("center", d3.forceCenter(width/2, height/2));

    function startForce() {
        simulation.nodes(nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(links);

        simulation.alpha(1).restart();
    }

    function stop() {
        simulation.stop();
        save();
    }

    function getFileId() {
        return "t" + String(Math.round(threshold*100));
    }

    function save() {
        fileNodeDb.save({
            _id: getFileId(),
            threshold: threshold,
            nodes: normalizeNodes(nodes),
            links: links
        });
    }

    function normalizeNodes(_nodes) {
        var normalizedNodes = [];
        _nodes.forEach(function (node) {
            var normalizedNode = Object.assign({}, node);
            normalizedNode.x = node.x / width;
            normalizedNode.y = node.y / height;
            normalizedNodes.push(normalizedNode);
        });

        return normalizedNodes;
    }

    function denormalizeNodes(normalizedNodes) {
        var denormalizedNodes = [];

        normalizedNodes.forEach(function (normalizedNode) {
            var denormalizedNode = Object.assign({}, normalizedNode);
            denormalizedNode.x = normalizedNode.x * width;
            denormalizedNode.y = normalizedNode.y * height;
            denormalizedNodes.push(denormalizedNode);
        });

        return denormalizedNodes;
    }

    function ticked() {
        var dimensions = getDimensions();
        var pinchX = width / dimensions.width;
        var pinchY = height / dimensions.height;

        circlesG.selectAll("circle.node")
            .attr("cx", function (d) {
                d.pcx = (d.x - dimensions.minX) * pinchX;
                return d.pcx;
            })
            .attr("cy", function (d) {
                d.pcy = (d.y - dimensions.minY) * pinchY;
                return d.pcy;
            });

        currentSvg = d3n.svgString();
        console.log(id + ": " + tickCtr++);
    }

    function drawNodes() {
        var selectionWithData = circlesG.selectAll("circle.node")
            .data(nodes, function (d) {
                return d.name;
            });

        selectionWithData.enter()
            .append("circle")
            .attr("class", "node")
            .attr("id", function (d, i) {
                var index = d.index > -1 ? d.index : i;
                return "node-" + index;
            })
            .attr("r", 1)
            .attr("fill", function (d) {
                var color = colorForNodeName(d.name);
                d.color = color;
                return color;
            });

        selectionWithData.exit().remove();
    }

    this.start = start;
    this.stop = stop;
    this.save = save;

    this.getSvg = function () {
        return currentSvg;
    };

    this.getNodesAndLinks = function () {
        return ({
            nodes: nodes,
            links: fileNodeDb.serializeLinks(links)
        });
    }
};

module.exports = Force;
