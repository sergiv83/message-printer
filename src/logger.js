const info = (...arguments) => {
    console.log(arguments);
};

const warn = (...arguments) => {
    console.warn(arguments);
};

const debug = (...arguments) => {
    console.debug(arguments);
};

const error = (...arguments) => {
    console.error(arguments);
};

module.exports = {
    debug,
    info,
    warn,
    error,
};
