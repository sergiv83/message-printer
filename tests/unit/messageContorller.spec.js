require('../helper');
const db = require('../../src/boundaries/db/db');
const { promiseTimeout } = require('../helper');
const { assert } = require('chai');
const sinon = require('sinon');

const { processSavedMessages } = require('../../src/controllers/messageController');

describe('MessageController', () => {

    let logSpy;

    beforeEach(() => {
        logSpy = sinon.spy(console, 'log');
    });

    afterEach(() => {
        logSpy.restore();
    });

    it('Should process saved messages in correct order', async () => {
        const now = Date.now();
        const savedMessages = [
            {message: '2', timeAt: now - 200}, // second
            {message: '1', timeAt: now - 1000}, // should be first
            {message: '3', timeAt: now - 100}, // third
            {message: '4', timeAt: now + 100}, // forth
        ];
        await Promise.all(savedMessages.map(message => db.saveMessage(message) ));

        //act
        await processSavedMessages();

        await promiseTimeout(200);

        // assert
        assert.equal(logSpy.getCalls()[0].args[0], savedMessages[1].message);
        assert.equal(logSpy.getCalls()[1].args[0], savedMessages[0].message);
        assert.equal(logSpy.getCalls()[2].args[0], savedMessages[2].message);
        assert.equal(logSpy.getCalls()[3].args[0], savedMessages[3].message);
    });
});


