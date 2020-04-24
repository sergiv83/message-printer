const db = require('../boundaries/db/db');
const logger = require('../../src/logger');

db.subscriber.on('message', async () => {
    // of course all this steps should be transactional
    const message = await db.pull(); // get from list

    if (message) {
        logger.info(message.message);
        await db.deleteMessage(message); // delete message after processing
    }
});
