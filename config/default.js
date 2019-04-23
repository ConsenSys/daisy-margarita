const path = require("path");
const assert = require("assert");
const dotenv = require("dotenv");

const pkg = require("../package.json");

dotenv.config();

assert(
  process.env.AUTHORIZER_PRIVATE_KEY,
  "Missing AUTHORIZER_PRIVATE_KEY env var.",
);

module.exports = {
  // base config
  NODE_ENV: "development",
  version: pkg["version"],
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 9999,
  instance: process.env.NODE_APP_INSTANCE || null, // PM2 instance

  provider: {
    uri: process.env.PROVIDER_URI,
  },

  mnemonic: process.env.MNEMONIC,

  authorizer: {
    privateKey: process.env.AUTHORIZER_PRIVATE_KEY,
  },

  daisy: {
    identifier: process.env.DAISY_ID,
    secretKey: process.env.DAISY_SECRET_KEY,
  },

  renderer: {
    engine: "nextjs",
    options: {
      dev: true,
      dir: "./client", // relative to package.json root
    },
  },

  // koa config
  proxy: false,
  silent: false,
  subdomainOffset: 0,
  keys: ["SECRET_KEY"],

  // koa-static
  statics: {
    // https://github.com/koajs/static#options
    dir: path.join(__dirname, "..", "public"),
    options: {
      maxage: 0,
      hidden: false, // hidden files
      index: "index.html",
      gzip: true,
      br: true,
    },
  },

  // koa-session config (https://github.com/koajs/session)
  session: {
    key: "margarita-poc:session:dev",
    maxAge: 86400000,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false,
    secure: false,
    sameSite: false,
    domain: undefined,
  },
};
