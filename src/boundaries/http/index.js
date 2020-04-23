const requireDirectory = require('require-directory');

const modules = requireDirectory(module);

const processed = Object.keys(modules).reduce((object, controller) => {
    object[modules[controller].name] = modules[controller];
    return object;
}, {});

module.exports = processed;
