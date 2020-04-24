const messageController = require('../../controllers/messageController');
const { ValidationError } = require('../../../src/utils');

module.exports = {
    name: 'echoAtTime',
    async echoAtTime(ctx) {
        await messageController.saveMessage(ctx.request.body);
        ctx.body = ctx.request.body;
    }
};
