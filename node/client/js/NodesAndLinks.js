'use strict';

bottle.factory("NodesAndLinks", function (container) {

    var SimplePromise = container.SimplePromise;
    var proxy = container.proxy;

    function NodesAndLinks(forceId) {

        var nodes = [];
        var links = [];

        var readyPromise = new SimplePromise();

        function deserializeLinks(serializedLinks, nodes) {
            var deserializedLinks = serializedLinks.map(function (serializedLink) {
                return ({
                    value: serializedLink.value,
                    source: nodes[serializedLink.sourceIndex],
                    target: nodes[serializedLink.targetIndex],
                    index: serializedLink.index
                })
            });

            return deserializedLinks;
        }

        function addLinkToNodeSourceList(link) {
            var node = link.source;
            if(node.sourceLinks == null) {
                node.sourceLinks = [];
            }
            node.sourceLinks.push(link);
        }

        function addLinkToNodeTargetList(link) {
            var node = link.target;
            if(node.targetLinks == null) {
                node.targetLinks = [];
            }
            node.targetLinks.push(link);
        }

        function addLinksToNodes() {
            links.forEach(function (link) {
                if(link.source != null) {
                    if(link.source.sourceLinks == null || link.source.sourceLinks.indexOf(link) < 0) {
                        addLinkToNodeSourceList(link)
                    }
                    if(link.target.targetLinks == null || link.target.targetLinks.indexOf(link) < 0) {
                        addLinkToNodeTargetList(link)
                    }
                }
            });
        }

        function loadNodesAndLinks() {
            proxy.getNodesAndLinks(forceId).then(function (nodesAndLinks) {
                nodes = nodesAndLinks.nodes;
                links = deserializeLinks(nodesAndLinks.links, nodesAndLinks.nodes);
                addLinksToNodes();
                readyPromise.resolve(nodes);
            });
        }

        function searchRelPaths(relPathFragment) {
            var relPaths = [];
            nodes.forEach(function (node) {
                if(node.name.indexOf(relPathFragment) >= 0) {
                    relPaths.push(node.name);
                }
            });

            return relPaths;
        }

        function getPosFromfRelPath(partOfRelPath) {
            for(var i = 0; i < nodes.length; i++) {
                if(nodes[i].name == partOfRelPath) {
                    return {
                        x: nodes[i].pcx,
                        y: nodes[i].pcy
                    }
                }
            }

            return undefined;
        }

        this.ready = function () {
            return readyPromise.promise;
        };

        this.getNumberOfLinks = function () {
            return links.length;
        };

        this.searchRelPaths = searchRelPaths;
        this.getPosFromfRelPath = getPosFromfRelPath;

        loadNodesAndLinks();
    }

    return NodesAndLinks;
});
