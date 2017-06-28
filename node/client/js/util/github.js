'use strict';

/* global bottle */

bottle.factory("github", function (container) {

    function createContentUrl(relPath) {
        return "https://github.com/frappe/erpnext/blob/develop/" + relPath;
    }

    return {
        createContentUrl: createContentUrl
    };
});
