import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withSSR } from "koa-nextjs/react";
import Head from "next/head";

import { Page } from "../components";

const MODULE_URL = "https://cdn.daisypayments.com/latest/module.min.js";
// const MODULE_URL = "http://127.0.0.1:8080/latest/module.min.js";

class StoreCheckoutWithPaymentModule extends PureComponent {
  render() {
    // <script> would usually include async but https://github.com/zeit/next.js/issues/9070
    return (
      <>
        <Head>
          <script async src={MODULE_URL} />
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
                    data-invoice="hXtZAZciV"
                    data-override_host="http://0.0.0.0:5000"
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
