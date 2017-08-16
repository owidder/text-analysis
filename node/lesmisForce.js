const D3Node = require('d3-node');
const lesmis = require('./lesmis');

// from: https://bl.ocks.org/mbostock/4062045

const styles = `
.links line {
  stroke: #999;
  stroke-opacity: 0.6;
}

.nodes circle {
  stroke: #fff;
  stroke-width: 1.5px;
}
`;

var options = {
    styles: styles
};

var width = 960,
    height = 500;

var d3n = new D3Node(options);
const d3 = d3n.d3;
var svg = d3n.createSVG(width, height);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d.id;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(lesmis.links)
    .enter().append("line")
    .attr("stroke-width", function (d) {
        return Math.sqrt(d.value);
    });

var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(lesmis.nodes)
    .enter().append("circle")
    .attr("r", 5)
    .attr("fill", function (d) {
        return color(d.group);
    });

node.append("title")
    .text(function (d) {
        return d.id;
    });

simulation
    .nodes(lesmis.nodes)
    .on("tick", ticked);

simulation.force("link")
    .links(lesmis.links);

function ticked() {
    console.log("tick");
    link
        .attr("x1", function (d) {
            return d.source.x;
        })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        });

    node
        .attr("cx", function (d) {
            return d.x;
        })
        .attr("cy", function (d) {
            return d.y;
        });
}

setTimeout(() => {
    simulation.stop();
    console.log(d3n.svgString());
}, 3000);
