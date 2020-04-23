const db = require('../boundaries/db/db');
const logger = require('../../src/logger');

db.subscriber.on('message', async () => {
    const message = await db.pull(); // get from list

    if (message) {
        logger.info(message.message);
        await db.deleteMessage(message); // delete message after processing
    }
});
