import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withSSR } from "koa-nextjs/react";
import Head from "next/head";

import { Page } from "../components";

class StoreCheckoutWithPaymentModule extends PureComponent {
  render() {
    // <script> would usually include async but https://github.com/zeit/next.js/issues/9070
    return (
      <>
        <Head>
          <script async src="http://127.0.0.1:8080/module.min.js" />
        </Head>
        <Page>
          <Page.Navbar {...this.props} />
          <Page.Body>
            <div className="container">
              <div className="row">
                <div className="col col-xs-12">
                  <h1>Checkout with Daisy</h1>
                </div>
              </div>

              <div className="row">
                <div className="col col-xs-6" />
                <div className="col col-xs-6">
                  <div
                    id="daisy-payment-module"
                    data-invoice="bIIDxPhZ"
                    data-environment="development"
                  />
                </div>
              </div>
            </div>
          </Page.Body>
        </Page>
      </>
    );
  }
}

export default withSSR()(StoreCheckoutWithPaymentModule);
