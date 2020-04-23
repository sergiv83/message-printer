const messageController = require('../../controllers/messageController');

module.exports = {
    name: 'echo',
    async echoAtTime(ctx) {
        await messageController.saveMessage(ctx.request.body);
        ctx.body = ctx.request.body;
    }
};
