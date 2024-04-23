const sitesRouter = require('./site');
// const newsRouter = require('./news');
const productsRouter = require('./products');
// const meRouter = require('./me');
function route(app) {
    // app.use('/news', newsRouter);
    // app.use('/me', meRouter);
    app.use('/products', productsRouter);
    app.use('/', sitesRouter);
}
module.exports = route;
