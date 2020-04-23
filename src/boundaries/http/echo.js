const messageController = require('../../controllers/messageController');
const { ValidationError } = require('../../../src/utils');

module.exports = {
    name: 'echo',
    async echoAtTime(ctx) {
        if (!ctx.request.body || !ctx.request.body.message || !ctx.request.body.timeAt) {
            throw new ValidationError('Body should contain message and timeAt');
        }
        await messageController.saveMessage(ctx.request.body);
        ctx.body = ctx.request.body;
    }
};
