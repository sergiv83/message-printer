const KoaRouter = require('koa-router');
const httpBoundaries = require('./http');

const routesConfig = [
    { method: 'GET',  route: '/health-check', boundary: httpBoundaries.healthCheck,  action: 'healthCheck' },
    { method: 'POST', route: '/echoAtTime',   boundary: httpBoundaries.echoAtTime,   action: 'echoAtTime' }
];

const router = new KoaRouter();

routesConfig.forEach(config => {
    const method = config.method.toLowerCase();

    router[method](
        config.route,
        async (ctx, next) => {
            try {
                await config.boundary[config.action](ctx);
                await next();
            } catch (err) {
                ctx.status = err.status || 500;
                ctx.body = err.message;
                ctx.app.emit('error', err, ctx);
            }
        }
    );
});

module.exports = router;
