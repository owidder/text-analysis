// Pre-render d3 force-directed graph at server side
// Call node pre_render_d3_graph.js to generate d3_graph.html
// Original idea and framework borrowed from https://gist.github.com/mef/7044786

var d3 = require('d3')
    , jsdom = require('jsdom')
    , fs = require('fs')
    , htmlStub = '<html><head> \
	<style>.node { stroke: #fff; fill: #ccc; stroke-width: 1.5px; } \
	.link { stroke: #333; stroke-opacity: .5; stroke-width: 1.5px; }</style> \
	</head><body><div id="dataviz-container"></div><script src="js/d3.v3.min.js"></script></body></html>'

jsdom.env({
    features : { QuerySelector : true }
    , html : htmlStub
    , done : function(errors, window) {
        // this callback function pre-renders the dataviz inside the html document, then export result into a static html file

        var el = window.document.querySelector('#dataviz-container')
            , body = window.document.querySelector('body')

        // generate the graph
        var width = 600,
            height = 600;

        var force = d3.layout.force()
            .charge(-30)
            .linkDistance(30)
            .size([width, height])
            .on("tick", tick);

        function tick() {
            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })

            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        }

        var svg = d3.select(el)
            .append('svg:svg')
            .attr('width', width)
            .attr('height', height);

        var nodes = [],
            links = [];

        nodes.push({id: 1, name: 'p1', group: 0});
        nodes.push({id: 2, name: 'p2', group: 0});
        nodes.push({id: 3, name: 'p3', group: 1});
        links.push({source: 1, target: 2, value: 1});

        var color = d3.scale.category20();

        force.nodes(nodes)
            .links(links)
            .start();

        var link = svg.selectAll(".link")
            .data(links)
            .enter().insert("line")
            .attr("class", "link");

        var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function(d) { return color(d.group); });

        // Here is the key. Without calling force.tick(), the simulation will not start and the nodes and links
        // will not have coordinates.
        for (var i = 0; i<10; i++)
            force.tick();

        // save result in an html file
        fs.writeFile('d3_graph.html', window.document.innerHTML, function(err) {
            if(err) {
                console.log('error saving document', err)
            } else {
                console.log('d3_graph.html was saved!')
            }
        })
    } // end jsDom done callback
})