/* eslint no-param-reassign:0 */

const RenderEngine = require("koa-nextjs");

module.exports = async function setupRenderer(globals, app) {
  const { config } = globals;

  const engine = await RenderEngine.start({
    options: config.get("renderer.options"),
  });

  // engine.router is an instance of `koa-router`
  app.use(engine.router.routes());

  app.context.render = async function render({ page, props = {}, options }) {
    const ctx = this;

    // ctx.state.locals are implicit props.
    ctx.body = await engine.toHTML(ctx, {
      page,
      props: { ...props, ...ctx.state.locals },
      options,
    });
  };

  const isDev = config.get("NODE_ENV") === "development";

  app.context.renderBoomError = async function renderError(err) {
    const ctx = this;

    const {
      output: { payload },
    } = err;
    ctx.status = payload.statusCode || 500;

    return ctx.render({
      page: ctx.status >= 500 ? "errors/500" : "errors/400",
      props: {
        statusCode: payload.statusCode,
        data: err.data,
        error: payload.error,
        message: payload.message,
        stack: isDev ? err.stack : undefined,
      },
      options: {
        staticMarkup: true,
      },
    });
  };

  app.context.renderBoomErrorAsJSON = async function renderErrorAsJSON(err) {
    const ctx = this;

    /**
     * Example Error:
     *
     * err = {
     *   data: {
     *     questionnaire: ["This field is required."],
     *   },
     *   isBoom: true,
     *   isServer: false,
     *   output: {
     *     statusCode: 400,
     *     payload: {
     *       message:
     *         "Request failed with status code 400: Request failed with status code 400",
     *       statusCode: 400,
     *       error: "Bad Request",
     *     },
     *     headers: {},
     *   },
     * };
     */

    ctx.status = err.output.payload.statusCode || 500;

    ctx.body = {
      error: true,
      data: err.data,
      message: err.message, // custom message, it's the first argument of a Boom error
      payload: err.output.payload,
      stack: isDev ? err.stack : undefined,
    };
  };

  return app;
};
