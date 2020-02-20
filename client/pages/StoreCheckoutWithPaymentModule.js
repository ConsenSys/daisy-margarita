import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withSSR } from "koa-nextjs/react";
import Head from "next/head";

import { Page } from "../components";
import { withMetaMaskContext } from "../addons/metamask";

class StoreCheckoutWithPaymentModule extends PureComponent {
  static propTypes = {
    invoice: PropTypes.any.isRequired,
    metamask: PropTypes.object.isRequired,
  };

  render() {
    const { invoice } = this.props;

    return (
      <>
        <Head>
          <script async src="http://127.0.0.1:8080/module.js" />
        </Head>
        <Page>
          <Page.Navbar {...this.props} />
          <Page.Body>
            <div className="container">
              <div className="row">
                <div className="col col-xs-12">
                  <h1>Checkout</h1>
                </div>
              </div>

              <div className="row">
                <div className="col col-xs-6">
                  <p>
                    Total: {invoice["amount"]} {invoice["symbol"]}
                  </p>
                  <p>Status: {invoice["state"]}</p>
                </div>
                <div className="col col-xs-6">
                  <a
                    href="http://0.0.0.0:5000/p/_1xYbKjI"
                    id="daisy-payments-module-button"
                  >
                    Daisy
                  </a>
                </div>
              </div>
            </div>
          </Page.Body>
        </Page>
      </>
    );
  }
}

export default withSSR()(withMetaMaskContext(StoreCheckoutWithPaymentModule));
