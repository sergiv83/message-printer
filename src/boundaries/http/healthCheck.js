const meta = require('../../../package.json');

module.exports = {
    name: 'healthCheck',
    async healthCheck(ctx) {
        ctx.body = {
            result:  'OK',
            version: meta.version
        };
    }
};
