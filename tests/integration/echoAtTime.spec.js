require('../helper');
const request = require('supertest');
const { assert } = require('chai');
const app = require('../../src/app');
const db = require('../../src/boundaries/db');
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
        const now = Date.now() + 100;
        const body = { message: 'hello', timeAt: now };

        // act
        const res = await request(app.server)
            .post('/echoAtTime')
            .send(body);

        assert.equal(res.statusCode, 200);
        assert.equal(res.text, "OK");

        const savedMessage = await db.getFirstMessage(body.timeAt);
        assert.deepEqual(savedMessage, body.message);

        await promiseTimeout(200);
        assert.equal(logSpy.getCalls()[0].firstArg, body.message);

        const existsCode = await db.exists(body.timeAt);
        assert.equal(existsCode, 0);
    });

    it('Should print messages in correct order', async () => {
        const timeAt = Date.now() + 100;
        const timeAt2 = Date.now() + 50;
        const message1 = { message: 'hello3', timeAt };
        const message2 = { message: 'hello2', timeAt: timeAt2 };

        const res = await request(app.server)
            .post('/echoAtTime')
            .send(message1);

        const res2 = await request(app.server)
            .post('/echoAtTime')
            .send(message2);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.text, "OK");

        assert.equal(res2.statusCode, 200);
        assert.deepEqual(res2.text, "OK");

        await (promiseTimeout(200)); // wait 150 ms

        assert.equal(logSpy.getCalls()[1].firstArg, message1.message);
        assert.equal(logSpy.getCalls()[0].firstArg, message2.message);
    });

    it('Should not print message with `timeAt` in the past', async () => {
        const now = Date.now() - 1000;
        const body = { message: 'hello', timeAt: now };
        const res = await request(app.server)
            .post('/echoAtTime')
            .send(body);

        assert.equal(res.statusCode, 400);
    });

    it('Should validate incoming message', async () => {
        const body = { message: 'hello' };
        const res = await request(app.server)
            .post('/echoAtTime')
            .send(body);

        assert.equal(res.statusCode, 400);
    });

    it('Should return 500 code if Redis is not available', async () => {
        const now = Date.now() + 100;
        const body = { message: 'hello', timeAt: now };
        const dbStub = sinon.stub(db, 'saveMessage').throws(new Error('some test error'));

        try{
            const res = await request(app.server)
                .post('/echoAtTime')
                .send(body);

            assert.equal(res.status, 500);
        } finally {
            dbStub.restore();
        }

    });
});
