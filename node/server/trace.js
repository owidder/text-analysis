var logger = require('tracer').colorConsole();

function _in(name) {
    logger.trace("-> " + name);
    return name;
}

function _out(name) {
    logger.trace("<- " + name);
}

module.exports = {
    in: _in,
    out: _out
}
