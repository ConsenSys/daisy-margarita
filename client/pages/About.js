import React, { PureComponent } from "react";
import { withSSR } from "koa-nextjs/react";

import { Page } from "../components";

class About extends PureComponent {
  state = {};

  render() {
    return (
      <Page>
        <Page.Navbar {...this.props} />
        <Page.Body>
          <div className="container">
            <h1>About</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
        </Page.Body>
      </Page>
    );
  }
}

export default withSSR()(About);
