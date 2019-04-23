import React, { PureComponent } from "react";
import { withSSR } from "koa-nextjs/react";

import { Page } from "../components";

// const STATUS = {
//   NOT_STARTED: "NOT_STARTED",
//   PROCESSING: "PROCESSING",
//   SUCCESS: "SUCCESS",
//   FAILED: "FAILED",
// };

class Subscriptions extends PureComponent {
  static defaultProps = {
    subscriptions: [],
  };

  render() {
    const { subscriptions, ...props } = this.props;

    return (
      <Page>
        <Page.Navbar {...props} />

        <Page.Body>
          <div className="container">
            <h1>Subscriptions</h1>
          </div>
          <div className="container">{subscriptions.length}</div>
        </Page.Body>
      </Page>
    );
  }
}

export default withSSR()(Subscriptions);
