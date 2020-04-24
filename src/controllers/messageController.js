const db = require('../boundaries/db/db');
const { ValidationError } = require('../../src/utils');

const pushAndPublishWithTimeout = (message, ms) => {
    setTimeout(async () => { // message will be printed when expected
        await db.push(message); // push to list, all subscriber read as brpop, so only one will receive message
        await db.publish(message); // notify subscribers
    }, ms);
};
/*
* this would work only if single instance of publisher exists :(
* but as a POC
* Problem here is when message is waiting to be published in one instance
* and other instance is restarted, it reads again messages in db,
* and schedules it to print once more.
*
* As an idea here can be used SET as en intermediate step before publish
* too prevent publishing duplicated messages,
*/
const processSavedMessages = async () => {
    const keys = await db.getSavedKeys(); // usage of redis keys is not a good idea
    const messages = await Promise.all(keys.map((key) => db.getMessage(key)));
    const filteredItems = messages.filter(item => item !== null);
    filteredItems.sort((a, b) => a.timeAt - b.timeAt); // sort items by time

    filteredItems.forEach(message => {
        const now = Date.now();
        pushAndPublishWithTimeout(message, message.timeAt - now); // if now > timeAt, all callbacks will be processed in the next cycle of event loop;
    });
};

module.exports = {
    async saveMessage(message) {
        // some small and simple validation

        if (!message || !message.message || !message.timeAt) {
            throw new ValidationError('Body should contain message and timeAt');
        }
        const now = Date.now();
        if (now > message.timeAt) {
            throw new ValidationError('timeAt should be in future');
        }

        await db.saveMessage(message); // save to storage
        pushAndPublishWithTimeout(message, message.timeAt - now);
    },
    processSavedMessages,
};
