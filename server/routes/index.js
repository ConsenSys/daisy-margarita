const Router = require("koa-router");
const compose = require("koa-compose");
const Boom = require("boom");
const dedent = require("dedent");
const uuidv4 = require("uuid/v4");
const { ServiceSubscriptions } = require("@daisypayments/daisy-sdk/private");
const webhooks = require("@daisypayments/daisy-sdk/private/webhooks");
const fetch = require("node-fetch"); // eslint-disable-line no-shadow

const {
  handledErrors,
  unhandledErrors,
  handledJSONErrors,
  unhandledJSONErrors,
} = require("../middlewares/errors");

module.exports = async function createDomains(globals) {
  const { config, db, pkg } = globals;

  const PROMO_CODE = "PROMO_CODE";

  const SDK_DEV = {
    // baseURL: "https://sdk.staging.daisypayments.com/",
    // baseURL: "http://localhost:8000",
    baseURL: "http://167.172.238.224:8000",
  };

  const subscriptionService = new ServiceSubscriptions(
    {
      identifier: config.get("daisy.identifier"),
      secretKey: config.get("daisy.secretKey"),
    },
    SDK_DEV,
    { fetch },
  );

  const router = new Router();

  const view = compose([unhandledErrors(globals), handledErrors(globals)]);
  const api = compose([
    unhandledJSONErrors(globals),
    handledJSONErrors(globals),
  ]);

  const auth = (ctx, next) => {
    if (!ctx.state.user) {
      return ctx.redirect("/session/login/");
    } else {
      return next();
    }
  };

  router.use((ctx, next) => {
    // ctx.state.locals are implicit props.
    ctx.state.locals = ctx.state.locals || {};
    ctx.state.locals.user = ctx.state.user;
    return next();
  });

  router.get("/", view, async ctx => {
    await ctx.render({
      page: "index",
      props: {},
    });
  });

  router.get("/health", api, async ctx => {
    ctx.body = pkg;
  });

  router.get("/about/", view, async ctx => {
    await ctx.render({
      page: "About",
      props: {},
    });
  });

  router.get("/session/logout/", view, async ctx => {
    ctx.session.id = null;
    ctx.redirect("/");
  });

  router.get("/session/login/", view, async ctx => {
    if (ctx.state.user) {
      return ctx.redirect("/");
    }
    return ctx.render({
      page: "Login",
      props: {},
    });
  });

  router.post("/api/session/login/", api, async ctx => {
    const { body } = ctx.request;

    const user = db
      .get("users")
      .find({
        email: body["email"],
        password: body["password"],
      })
      .pick(["id", "email", "name"])
      .value();

    if (user) {
      ctx.session.id = user["id"];
      ctx.status = 201;
      ctx.body = user;
    } else {
      throw Boom.unauthorized("Wrong email or password.");
    }
  });

  router.get("/account/", view, auth, async ctx => {
    const subscriptions = db
      .get("users")
      .find(ctx.state.user)
      .get("subscriptions", [])
      .value();

    await ctx.render({
      page: "Account",
      props: { subscriptions },
    });
  });

  // GET /subscriptions/
  router.get("/subscriptions/", view, async ctx => {
    ctx.redirect("/account/");
  });

  // GET /subscriptions/new/?plan=PLAN
  router.get("/subscriptions/new/", view, auth, async ctx => {
    const { plans } = await subscriptionService.getData();
    const plan = plans.find(p => p["name"] === ctx.query["plan"]);
    if (!plan) {
      throw Boom.notFound("Plan not found", { plan: ctx.query["plan"] });
    }

    const data = {
      id: uuidv4(),
      plan,
      daisyId: null,
      account: null,
      signatureExpiresAt: null,
      token: null,
      signature: null,
    };

    const subscription = db
      .get("users")
      .find(ctx.state.user)
      .get("subscriptions", [])
      .insert(data)
      .write();

    ctx.redirect(`/subscriptions/${subscription["id"]}/`);
  });

  // GET /subscriptions/:id/
  router.get("/subscriptions/:id/", view, auth, async ctx => {
    const subscription = db
      .get("users")
      .find(ctx.state.user)
      .get("subscriptions", [])
      .find({ id: ctx.params["id"] })
      .value();
    if (!subscription) {
      throw Boom.notFound("Subscription not found", { id: ctx.params["id"] });
    }

    const { plans, ...manager } = await subscriptionService.getData();

    const plan = plans.find(p => p["id"] === subscription["plan"]["id"]);
    if (!plan) {
      throw Boom.notFound("Plan not found", { id: subscription["plan"]["id"] });
    }

    await ctx.render({
      page: "Subscribe",
      props: {
        plan,
        subscription,
        manager: {
          ...manager,
          identifier: config.get("daisy.identifier"),
          secretKey: config.get("daisy.secretKey"),
        },
      },
    });
  });

  // POST /api/subscriptions/:id
  router.post("/api/subscriptions/:id/", api, auth, async ctx => {
    const subscription = db
      .get("users")
      .find(ctx.state.user)
      .get("subscriptions", [])
      .find({ id: ctx.params["id"] })
      .value();

    if (!subscription || !subscription["plan"]) {
      throw Boom.notFound("Entry or plan not found.", { id: ctx.params["id"] });
    }

    let authSignature = null; // for private plans
    const { agreement, receipt, signature, code } = ctx.request.body;
    if (subscription["plan"]["private"] && code !== PROMO_CODE) {
      throw Boom.badRequest("Invalid PROMO CODE", { code });
    } else if (subscription["plan"]["private"]) {
      const authorizer = {
        privateKey: Buffer.from(config.get("authorizer.privateKey"), "hex"),
      };
      authSignature = await subscriptionService.authorize(
        authorizer,
        agreement,
      );
    }

    const item = db
      .get("users")
      .find(ctx.state.user)
      .get("subscriptions", [])
      .find({ id: ctx.params["id"] });

    if (signature) {
      const { data } = await subscriptionService.submit({
        agreement,
        receipt,
        authSignature,
        signature,
      });

      ctx.status = 201;
      ctx.body = item
        .assign({
          daisyId: data["daisyId"], // save Daisy ID
          plan: subscription["plan"],
          agreement,
          receipt,
          signature,
        })
        .write();
    } else {
      ctx.status = 201;
      ctx.body = item
        .assign({
          receipt,
        })
        .write();
    }
  });

  // GET /api/subscriptions/:id
  router.get("/api/subscriptions/:id/", api, auth, async ctx => {
    const item = db
      .get("users")
      .find(ctx.state.user)
      .get("subscriptions", [])
      .find({ id: ctx.params["id"] })
      .value();

    if (!item) {
      throw Boom.notFound();
    } else if (!item["daisyId"]) {
      ctx.body = null;
      return;
    }

    const subscription = await subscriptionService.getSubscription({
      daisyId: item["daisyId"],
    });

    console.log(
      await subscriptionService.getSubscription({
        onChainId: subscription["onChainId"],
      }),
    );
    console.log(
      await subscriptionService.getReceipts({
        daisyId: subscription["daisyId"],
      }),
    );
    console.log(
      await subscriptionService.getReceipts({
        onChainId: subscription["onChainId"],
      }),
    );

    ctx.body = subscription;
  });

  // POST /api/callback/
  router.post("/api/callback/", api, async ctx => {
    const { digest, ...payload } = ctx.request.body;

    // TODO: associate to user.

    const isAuthentic = webhooks.verify({
      digest,
      message: payload,
      publicKey: dedent`
        -----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyUaW5FK4ogS2/j7e7h65
        u73/1QrdfocqHB1SD5bkMQO6Z2CR1+dqa9afty3DQ+mLJ7gupOjvYFYrsiIQoMVc
        J3zsmlYNjAnoHe8Kn2nU+Gjq+mJ6mscRIC6uMIMm/LslsiMugeL1YlpYXZ0uwbnY
        TDKiC+g08iGc3tNiaFVCrzNcTHjoTyuCF7M0Pvh21UkWPcAJFDSR+YTtrXjpLMAB
        jm3Vij8IarAmoCmTMIlUPbCb3j6NMjP4r0hulFUx6/u0DFvQPfKwzKnOph0CoX8u
        kde74DGOsKxinYycP20w7vaypC9eLY7M3PKtJCft3EypTEvgZRHG5Wd2BaTOvzF4
        tQIDAQAB
        -----END PUBLIC KEY-----
      `,
    });

    if (!isAuthentic) {
      throw Boom.forbidden("Not authentic");
    }

    ctx.status = 200;
    ctx.body = {
      authSignature: payload.authSignature,
      // redirectURL: "", // optional
    };
  });

  // GET /success/
  router.get("/success/", view, async ctx => {
    // TODO: create view
    ctx.body = "Invitation complete!";
  });

  return router;
};
