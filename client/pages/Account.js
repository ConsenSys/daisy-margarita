import React, { PureComponent } from "react";
import { withSSR } from "koa-nextjs/react";

import { Page } from "../components";

class Account extends PureComponent {
  state = {};

  static defaultProps = {
    subscriptions: [],
  };

  render() {
    const { subscriptions, ...props } = this.props;

    // const { ...props } = this.props;
    // const subscriptions = [
    //   {
    //     id: 0,
    //     name: "PRO Plan",
    //     status: "active",
    //     expiration: "14/8/2019 - in 1 month 3 days",
    //   },
    //   {
    //     id: 1,
    //     name: "Basic Plan",
    //     status: "active",
    //     expiration: "14/7/2020 - in 1 year",
    //   },
    // ];

    return (
      <Page>
        <Page.Navbar {...props} />
        <Page.Body>
          <div className="container">
            <h1>Account</h1>
            <p className="lead">Subscriptions</p>
            {subscriptions.length === 0 ? (
              <a
                className="btn btn-primary btn-lg"
                href="/subscriptions/new?plan=p1"
                role="button"
              >
                Get the most popular plan
              </a>
            ) : (
              <div className="list-group">
                {subscriptions.map(sub => (
                  <a
                    key={sub["id"]}
                    href={`/subscriptions/${sub["id"]}`}
                    className="list-group-item list-group-item-action"
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">
                        bill: <code>{sub["id"]}</code>
                      </h5>
                      <small style={{ textTransform: "uppercase" }}>
                        {sub["status"]}
                      </small>
                    </div>
                    <p className="mb-1">
                      Donec id elit non mi porta gravida at eget metus. Maecenas
                      sed diam eget risus varius blandit.
                    </p>
                    <small>{sub["expiration"]}</small>
                  </a>
                ))}
              </div>
            )}
          </div>
        </Page.Body>
      </Page>
    );
  }
}

export default withSSR()(Account);
