const meta = require('../../../package.json');

module.exports = {
    name: 'api',
    async healthCheck(ctx) {
        ctx.body = {
            result:  'OK',
            version: meta.version
        };
    }
};
