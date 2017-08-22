'use strict';

bottle.factory("handlers", function (container) {

    function showFiles(relPaths, templateId, elementId) {
        var fileListElement = $("#" + elementId);
        fileListElement.empty();
        var filesTemplateScript = $("#" + templateId).html();
        var filesTemplate = Handlebars.compile(filesTemplateScript);
        var relPathsWithMetadata = relPaths.map(function(relPath, i) {
            var parts = relPath.split("/");
            var shortName = parts[parts.length-1];
            return {
                evenOdd: i%2 == 0 ? "even" : "odd",
                relPath: relPath,
                shortName: shortName,
                github: bottle.container.github.createContentUrl(relPath)
            }
        });
        var ctx = {
            currentHref: window.location.href,
            relPaths: relPathsWithMetadata
        };
        var filesHtml = filesTemplate(ctx);
        fileListElement.append(filesHtml);
    }

     function searchClicked(nodesAndLinks, inputId, scriptId, elementId) {
        var searchFor = $(inputId).val();
        var relPaths = nodesAndLinks.searchRelPaths(searchFor);
        if(!_.isEmpty(relPaths)) {
            showFiles(relPaths, scriptId, elementId);
        }
    }

    function moveToRelPath(nodesAndLinks, viewfinder, birdsviewWidth, birdsviewHeight, relPath) {
        if(!_.isEmpty(relPath)) {
            var pos = nodesAndLinks.getPosFromfRelPath(relPath);
            if(pos != null) {
                viewfinder.setRelPosition({
                    relX: pos.x / birdsviewWidth,
                    relY: pos.y / birdsviewHeight
                });
            }
        }
    }

    return {
        showFiles: showFiles,
        searchClicked: searchClicked,
        moveToRelPath: moveToRelPath
    };
});
