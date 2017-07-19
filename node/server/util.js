'use strict';

function compare(a, b) {
    if(a < b) {
        return -1
    }
    else if(a > b) {
        return 1;
    }
    return 0;
}

function findFunc(attributeName, valueToFind) {
    return function (element) {
        return (element[attributeName] == valueToFind);
    };
}


module.exports = {
    compare: compare,
    findFunc: findFunc
};
