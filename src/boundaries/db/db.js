const config = require('dotenv-extended');
const Redis = require('ioredis');

const redisConfig = {
    port: config.REDIS_PORT,
    host: config.REDIS_HOST,
    password: config.REDIS_SECRET
};

const redis = new Redis(redisConfig);
const subscriber = new Redis(redisConfig);

module.exports = {
    subscriber,
    async getSavedKeys() {
        return await redis.keys('*');
    },

    async saveMessage(message) {
        await redis.set(`${message.timeAt}`, JSON.stringify(message));
    },

    async deleteMessage(message) {
        await redis.del(`${message.timeAt}`);
    },

    async getMessage(timeAt) {
        return redis.get(`${timeAt}`)
            .then((res) => res && JSON.parse(res));
    },

    async push(message) {
        await redis.lpush('messagesList', JSON.stringify(message));
    },

    async publish(message) {
        await redis.publish('message', JSON.stringify(message));
    },

    async pull(){
        return await redis.brpop('messagesList', 0) // only one subscriber will receive message
            .then(result => {
                if (result && result[1]) {
                    return JSON.parse(result[1])
                }
            });
    },

    async clearDB() { await redis.flushdb(); },

    async closeInstance() {
        await redis.quit();
        await subscriber.quit();
    }
};

subscriber.subscribe('message', (channel, message) => {}); // subscribe
