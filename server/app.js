const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const helmet = require("koa-helmet");
const mount = require("koa-mount");
const session = require("koa-session");
const statics = require("koa-static");
const Boom = require("boom");
const isUndefined = require("lodash/isUndefined");
const isEmpty = require("lodash/isEmpty");

const setupRenderer = require("./renderer");
const createRouter = require("./routes");

module.exports = async function createApp(globals) {
  const { config, db } = globals;

  const app = new Koa();
  app.env = config.get("NODE_ENV");
  app.proxy = config.get("proxy");
  app.silent = config.get("silent");
  app.subdomainOffset = config.get("subdomainOffset");
  app.keys = config.get("keys");

  await setupRenderer(globals, app);

  // Add middlewares
  app.use(logger());
  app.use(helmet());
  app.use(mount("/public", statics(config.get("statics.dir"), config.get("statics.options"))));
  app.use(bodyParser());
  app.use(session({ ...config.get("session") }, app));

  const legacy = new Router();
  legacy.all("/favicon.ico", ctx => {
    ctx.redirect(`/public/favicon.ico`);
  });
  app.use(legacy.routes());

  app.use(async (ctx, next) => {
    const user = await db
      .get("users")
      .find({
        id: ctx.session.id,
      })
      .pick(["id", "email", "name"])
      .value();

    ctx.state.user = isEmpty(user) ? null : user;
    return next();
  });

  const router = await createRouter({ ...globals });

  // Setup routes
  app.use(router.routes());

  // Setup Not Found handler
  app.use(async (ctx, next) => {
    await next();

    const is404 = isUndefined(ctx.body) && ctx.status === 404;

    if (is404 && ctx.path.startsWith("/public")) {
      ctx.body = null;
      ctx.status = 404;
    } else if (is404) {
      const err = Boom.notFound("Not Found");

      // Set body based on `Accept` header
      const accepts = ctx.accepts("json", "html", "text");
      if (accepts === "json") {
        await ctx.renderBoomErrorAsJSON(err);
      } else if (accepts === "html") {
        await ctx.renderBoomError(err);
      } else {
        ctx.status = err.output.statusCode;
        ctx.body = "Not Found";
      }
    }
  });

  return app;
};
