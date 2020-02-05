/* eslint no-console:0, no-await-in-loop:0 */

"use strict"; // eslint-disable-line

const config = require("config");
const fs = require("fs");
const path = require("path");
const low = require("lowdb");
const lodashId = require("lodash-id");
const FileSync = require("lowdb/adapters/FileSync");

const createClient = require("./client-create");
const createApp = require("./app");

async function main() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf-8"),
  );

  const adapter = new FileSync("db.json");
  const db = low(adapter);
  db._.mixin(lodashId);

  await db
    .defaults({
      users: [
        {
          id: 1,
          email: "admin@daisypayments.com",
          password: "12345678",
          name: "John Appleseed",
          subscriptions: [],
          orders: [],
        },
      ],
      products: [
        {
          id: 1,
          name: "Record player",
          price: [`249`, "DAI"],
        },
        {
          id: 2,
          name: "Vinyl record",
          price: [`19`, "DAI"],
        },
        {
          id: 3,
          name: "Sleeve",
          price: [`1`, "DAI"],
        },
      ],
    })
    .write();

  let client = null;
  do {
    try {
      client = await createClient({ config });
    } catch (err) {
      console.error(err);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  } while (!client);

  // Poor man's dependency-injection pattern
  const globals = {
    config,
    pkg,
    auth: null,
    client,
    db,
  };

  const app = await createApp(globals);

  return new Promise(resolve => {
    const PORT = config.get("port");
    const HOST = config.get("host");

    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server ready at ${HOST}:${PORT}`);
      return resolve({ app, server, globals });
    });
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
