const db = require('../boundaries/db/db');

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
        this.status = 400;
    }
}

const pushAndPublishWithTimeout = (message, ms) => {
    setTimeout(async () => { // message will be printed when expedted
        await db.push(message); // push to list, all subscriber read as brpop, so only one will receive message
        await db.publish(message); // notify subscribers
    }, ms);
};

const processSavedMessages = async () => {
    const keys = await db.getSavedKeys();
    const messages = await Promise.all(keys.map((key) => db.getMessage(key)));
    const filteredItems = messages.filter(item => item !== null);
    filteredItems.sort((a, b) => a.timeAt - b.timeAt); // sort items by time

    filteredItems.forEach(message => {
        const now = new Date().getTime();
        pushAndPublishWithTimeout(message, message.timeAt - now); // if now > timeAt, all callbacks will be processed in the next cycle of event loop;
    });
};

module.exports = {
    async saveMessage(message) {
        const now = new Date().getTime();

        if (now > message.timeAt) {
            throw new ValidationError('timeAt should be in future');
        }
        await db.saveMessage(message); // save to storage
        pushAndPublishWithTimeout(message, message.timeAt - now);
    },
    processSavedMessages, // exported for test purposes
};
