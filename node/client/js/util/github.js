'use strict';

/* global bottle */

bottle.factory("github", function (container) {

    function createContentUrl(relPath) {
        if(relPath.startsWith("jira")) {
            return "https://iteragit.iteratec.de/owd/nge-text-analysis/tree/master/python/OpenSpeedMonitor/" + relPath;
        }
        else if(relPath.startsWith("gitlab")) {
            return "https://github.com/iteratec/OpenSpeedMonitor/blob/master/" + relPath.substr(7);
        }

        return "https://github.com/frappe/erpnext/blob/develop/" + relPath;
    }

    return {
        createContentUrl: createContentUrl
    };
});
