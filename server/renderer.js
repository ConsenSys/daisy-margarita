/* eslint no-param-reassign:0 */

const setupSSR = require("koa-nextjs");

module.exports = async function setupRenderer(globals, app) {
  const { config } = globals;

  switch (config.get("renderer.engine")) {
    case "nextjs": {
      await setupSSR(app, {
        options: config.get("renderer.options"),
      });
      // TODO: improve koa-nextjs module
      const old = app.context.render;

      app.context.render = function render({ page, props = {}, options }) {
        const ctx = this;

        // ctx.state.locals are implicit props.
        return old.bind(ctx)({
          page,
          props: { ...props, ...ctx.state.locals },
          options,
        });
      };
      break;
    }
    case "debugger":
    default: {
      app.context.render = function rawRender(arg) {
        const ctx = this;
        ctx.body = arg;
      };
    }
  }

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
