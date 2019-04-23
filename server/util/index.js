const isNil = require("lodash/isNil");
const pathToRegexp = require("path-to-regexp");

const regexCache = new Map();

module.exports = {
  /**
   * Usage:
      // * /orgs/:org/
      router.param("org", async (param: string, ctx: Types.CTX, next: Function) => {
        param = safeParam("/orgs/:org/(.*)", { ctx, param }); // eslint-disable-line no-param-reassign
        ...
      });
   */
  safeParam(path, { ctx, param }) {
    // FIXME: https://github.com/ZijianHe/koa-router/issues/422
    if (isNil(param)) {
      if (!regexCache.has(path)) {
        regexCache.set(path, pathToRegexp(path));
      }
      return regexCache.get(path).exec(ctx.path)[1];
    } else {
      return param;
    }
  },
};
