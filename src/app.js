const config = require('dotenv-extended').load({ errorOnMissing: true});
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('./boundaries/router');
const logger = require('./logger');
const messageController = require('./controllers/messageController');
require('./controllers/printer');

const app = {};
app.koa = new Koa();
app.koa.use(bodyParser());
app.koa.use(router.routes());
app.koa.use(router.allowedMethods());

app.koa.on('error', (err, context) => {
    // centralized koa error handling
    logger.error('Unexpected error happened: ', err);
});

app.server = app.koa.listen(config.HTTP_PORT);
logger.info(`Microservice started on port: ${ config.HTTP_PORT }`);

app.server.on('close', () => {
    logger.info('Microservice stopped');
});

(async () => {
    await messageController.processSavedMessages(); // run processing of saved messages
});

module.exports = app;
