const db = require('../boundaries/db');
const { ValidationError } = require('../../src/utils');

const processWithTimeout = (timeAt) => {
    setTimeout(async () => {
        const messages = await db.getAndRemoveMsgsTx(timeAt);// we can potentially have more than one message requested to be printed at specific time
        if (messages) {
            messages.forEach(msg => console.log(msg));
        }
    }, timeAt - Date.now());// if now > timeAt, all callbacks will be processed in the next cycle of event loop;
};


const processSavedMessages = async () => {
    const timestamps = await db.getSavedKeys();
    timestamps.sort().forEach(timeAt => processWithTimeout(timeAt));
};

module.exports = {
    async saveAndPublish(message) {
        // some small and simple validation

        if (!message || !message.message || !message.timeAt) {
            throw new ValidationError('Body should contain message and timeAt');
        }
        const now = Date.now();
        if (now > message.timeAt) {
            throw new ValidationError('timeAt should be in future');
        }

        await db.saveMessage(message); // save to storage
        await db.publish(message.timeAt);//notify all instances about new request
    },
    processSavedMessages,
    processWithTimeout
};
