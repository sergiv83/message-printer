const messageController = require('../../controllers/messageController');

module.exports = {
    name: 'echoAtTime',
    async echoAtTime(ctx) {
        await messageController.saveAndPublish(ctx.request.body);
        ctx.body = 'OK';
    }
};
