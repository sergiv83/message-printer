require('../helper');
const request = require('supertest');
const { assert } = require('chai');
const app = require('../../src/app');
const db = require('../../src/boundaries/db/db');
const sinon = require('sinon');
const { promiseTimeout } = require('../helper');

describe('[HTTP] echoAtTime', () => {
    let logSpy;

    beforeEach(() => {
        logSpy = sinon.spy(console, 'log');
    });

    afterEach(() => {
        logSpy.restore();
    });

    it('Should print message', async () => {
        const now = new Date().getTime() + 100; // todo: Date.now();
        const body = { message: 'hello', timeAt: now };

        // act
        const res = await request(app.server)
            .post('/echoAtTime')
            .send(body);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, body);

        const savedMessage = await db.getMessage(body.timeAt);
        assert.deepEqual(savedMessage, body);

        await promiseTimeout(200);
        assert.equal(logSpy.getCalls()[0].firstArg, body.message);

        const deletedMessage = await db.getMessage(body.timeAt);
        assert.isNull(deletedMessage, 'Message should be deleted after print');
    });

    it('Should print messages in correct order', async () => {
        const timeAt = new Date().getTime() + 100; // todo: Date.now();
        const timeAt2 = new Date().getTime() + 50; // todo: Date.now();
        const message1 = { message: 'hello2', timeAt };
        const message2 = { message: 'hello3', timeAt: timeAt2 };

        const res = await request(app.server)
            .post('/echoAtTime')
            .send(message1);

        const res2 = await request(app.server)
            .post('/echoAtTime')
            .send(message2);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, message1);

        assert.equal(res2.statusCode, 200);
        assert.deepEqual(res2.body, message2);

        await (promiseTimeout(200)); // wait 150 ms

        assert.equal(logSpy.getCalls()[1].firstArg, message1.message);
        assert.equal(logSpy.getCalls()[0].firstArg, message2.message);
    });

    it('Should not print message with `timeAt` in the past', async () => {
        const now = new Date().getTime() - 1000; // todo: Date.now();
        const body = { message: 'hello', timeAt: now };
        const res = await request(app.server)
            .post('/echoAtTime')
            .send(body);

        assert.equal(res.statusCode, 400);
    });
});
