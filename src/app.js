const config = require('dotenv-extended').load({ errorOnMissing: true});
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('./boundaries/http/router');
const logger = require('./logger');
const messageController = require('./controllers/messageController');
const db = require('./boundaries/db');

const app = {};
app.koa = new Koa();
app.koa.use(bodyParser());
app.koa.use(router.routes());
app.koa.use(router.allowedMethods());

app.koa.on('error', (err, context) => {
    // centralized koa error handling
    logger.error('Unexpected error happened: ', err);
});

app.server = app.koa.listen(process.env.HTTP_PORT);
logger.info(`Microservice started on port: ${ config.HTTP_PORT }`);

app.server.on('close', () => {
    logger.info('Microservice stopped');
});

const stopHandler = ({ error, exitCode, eventName }) => {
    if (exitCode === 0) {
        logger.info(`Microservice stopped by termination signal ${eventName}`);
    }
    if (error) {
        const { message, stack } = error;
        logger.error({ message, stack, eventName });
    }
    process.exit(exitCode);
};

[ 'SIGINT', 'SIGTERM', 'SIGQUIT' ].forEach(eventName => {
    process.on(eventName, () => {
        stopHandler({ eventName, exitCode: 0 });
    });
});

[ 'uncaughtException', 'unhandledRejection' ].forEach(eventName => {
    process.on(eventName, error => {
        stopHandler({ error, eventName, exitCode: 1 });
    });
});

(async () => {
    await messageController.processSavedMessages(); // run processing of saved messages
    db.subscriber.on('message', (channel, timeAt) => messageController.processWithTimeout(timeAt)); //subscribe to messages with timestamps
})();

module.exports = app;
