require('../helper');
const request = require('supertest');
const { assert } = require('chai');
const app = require('../../src/app');

describe('[HTTP] health-check', () => {
    it('Should return 200', async () => {
        const res = await request(app.server).get('/health-check');

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.result, 'OK');
    });
});
