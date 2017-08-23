var logger = require('tracer').colorConsole();

Object.defineProperty(global, '__stack', {
    get: function(){
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack){
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
    get: function(){
        return __stack[1].getLineNumber();
    }
});

Object.defineProperty(global, '__caller', {
    get: function () {
        return __stack[2];
    }
});

function _in(name) {
    var caller = __caller;
    logger.trace("-> " + caller.getFileName() + "#" + (name ? name : caller.getFunctionName()) + ":" + caller.getLineNumber());

    return name;
}

function _out(name) {
    var caller = __caller;
    logger.trace("<- " + caller.getFileName() + "#" + (name ? name : caller.getFunctionName()) + ":" + caller.getLineNumber());
}

module.exports = {
    in: _in,
    out: _out
}
