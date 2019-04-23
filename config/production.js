module.exports = {
  // base config
  NODE_ENV: "production",

  // koa config
  keys: [process.env.SECRET_KEY],
  proxy: true,

  renderer: {
    engine: "nextjs",
    options: {
      dev: false,
      dir: "./client", // relative to package.json root
    },
  },

  // koa-session config (https://github.com/koajs/session)
  session: {
    key: "margarita-poc:session",
    secure: false,
    sameSite: "strict",
    domain: process.env.DOMAIN || "localhost",
  },
};
