const jsdom = require("jsdom");
const d3 = require("d3");
const fs = require("fs");

const htmlStub = '<html><head> \
	<style>.node { stroke: #fff; fill: #ccc; stroke-width: 1.5px; } \
	.link { stroke: #333; stroke-opacity: .5; stroke-width: 1.5px; }</style> \
	</head><body><div id="dataviz-container"></div><script src="js/d3.v3.min.js"></script></body></html>';
const JSDOM = jsdom.JSDOM;

console.log(jdsom);