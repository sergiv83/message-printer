const app = require('../src/app');
const db = require('../src/boundaries/db/db');

before(async () => {
    await db.clearDB();
});

after(async () => {
    await db.clearDB();
    await db.closeInstance();
    await app.server.close();
});

const promiseTimeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
    promiseTimeout,
};
