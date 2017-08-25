'use strict';

/* global bottle */

bottle.factory("github", function (container) {

    function createContentUrl(relPath) {
        if(relPath.startsWith("jira")) {
            return "https://iteragit.iteratec.de/owd/nge-text-analysis/tree/master/python/OpenSpeedMonitor/" + relPath;
        }
        else if(relPath.startsWith("gitlab")) {
            return "https://github.com/iteratec/OpenSpeedMonitor/blob/1df3a7ef8bd3a4ab7a54d97f313b5e2142390cd4/" + relPath.substr(7);
        }

        return "https://github.com/frappe/erpnext/blob/develop/" + relPath;
    }

    return {
        createContentUrl: createContentUrl
    };
});
