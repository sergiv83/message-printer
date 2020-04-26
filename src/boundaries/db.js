const Redis = require('ioredis');
const logger = require('../logger');
const {unwrapTransactionResult} = require('../utils');

const redisConfig = {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_SECRET
};

const redis = new Redis(redisConfig);
const subscriber = new Redis(redisConfig);
subscriber.subscribe(process.env.PUB_SUB_KEY, (channel, message) => {}); // subscribe

module.exports = {
    subscriber,
    async getSavedKeys() {
        return await redis.keys('*');
    },

    async saveMessage(message) {
        return redis.rpush(`${message.timeAt}`, message.message);
    },

    async getFirstMessage(timeAt) {
        return redis.lrange(`${timeAt}`, 0, 0)
            .then((res) => res && res[0]);
    },

    async publish(time) {
        await redis.publish(process.env.PUB_SUB_KEY, time);
    },

    async clearDB() { await redis.flushdb(); },

    async closeInstance() {
        await redis.quit();
        await subscriber.quit();
    },

    async getAndRemoveMsgsTx(timeAt) {
        try {
            return await redis.multi()//open transaction
                        .lrange(`${timeAt}`, 0, -1)//get all messages for this key (timestamp)
                        .del(`${timeAt}`)// remove the key
                        .exec().then(unwrapTransactionResult);//release transaction
        } catch (e) {
            logger.warn(e);
        }
    },

    async exists(key) {
        return await redis.exists(key);
    }
};
