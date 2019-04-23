const Boom = require("boom");
const Youch = require("youch");

exports.unhandledErrors = function unhandledErrors(globals) {
  const { config } = globals;

  const isDev = config.get("NODE_ENV") === "development";

  return async function unhandledErrorsMiddleware(ctx, next) {
    try {
      await next();
    } catch (err) {
      if (isDev) {
        const youch = new Youch(err, ctx.req);
        // Render youch error screen
        ctx.status = 500;
        ctx.type = "text/html";
        ctx.body = await youch.toHTML();
      } else {
        // In production show a internal server error.
        console.error("DANGER: Unhandled Error:", err); // eslint-disable-line no-console
        ctx.status = 500;
        ctx.body = "Unknown Internal Server Error"; // do not render with React
      }

      // Emit to app.on("error") at src/index.js
      // @ts-ignore
      ctx.app.emit("error", err, ctx);
    }
  };
};

exports.handledErrors = function handledErrors(globals) {
  const { config } = globals;

  const isDev = config.get("NODE_ENV") === "development";

  return async function handledErrorsMiddleware(ctx, next) {
    try {
      await next();
    } catch (err) {
      // If unknown error, go to the upper handler
      if (!Boom.isBoom(err)) {
        throw err;
      }

      // Known error (we did throw the error), friendly user message here
      await ctx.renderBoomError(err); // See: server/ssr.js

      // Show the handled error in development in the Node.js console.
      if (isDev) {
        // Unhandled error are always shown.
        // @ts-ignore
        ctx.app.emit("error", err, ctx);
      }
    }
  };
};

// eslint-disable-next-line no-unused-vars
exports.unhandledJSONErrors = function unhandledJSONErrors(globals) {
  return async function unhandledJSONErrorsMiddleware(ctx, next) {
    try {
      await next();
    } catch (err) {
      await ctx.renderBoomErrorAsJSON(Boom.internal(err.message)); // See: server/ssr.js

      // Emit to app.on("error") at src/index.js
      // @ts-ignore
      ctx.app.emit("error", err, ctx);
    }
  };
};

exports.handledJSONErrors = function handledJSONErrors(globals) {
  const { config } = globals;

  const isDev = config.get("NODE_ENV") === "development";

  return async function handledJSONErrorsMiddleware(ctx, next) {
    try {
      await next();
    } catch (err) {
      // If unknown error, go to the upper handler
      if (!Boom.isBoom(err)) {
        throw err;
      }

      // Known error (we did throw the error), friendly user message here
      await ctx.renderBoomErrorAsJSON(err); // See: server/ssr.js

      // Show the handled error in development in the Node.js console.
      if (isDev) {
        // Unhandled error are always shown.
        // @ts-ignore
        ctx.app.emit("error", err, ctx);
      }
    }
  };
};
