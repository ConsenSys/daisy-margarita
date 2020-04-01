import React, { PureComponent } from "react";
import { ThemeProvider } from "styled-components";
import PropTypes from "prop-types";
import { withSSR } from "koa-nextjs/react";
import Head from "next/head";
import { InputControl, Input, theme } from "@daisypayments/petals";

import { Page } from "../components";

const MODULE_URL = "https://cdn.daisypayments.com/latest/module.min.js";
// const MODULE_URL = "http://127.0.0.1:8080/latest/module.min.js";

class StoreCheckoutWithPaymentModule extends PureComponent {
  state = {
    invoiceIdentifier: "",
  };

  handleInvoiceChange = ({ target: { value } }) => {
    this.setState({ invoiceIdentifier: value }, () => {
      if (window.DaisyPaymentModule) {
        window.DaisyPaymentModule.loadModule();
      }
    });
  };

  render() {
    // <script> would usually include async but https://github.com/zeit/next.js/issues/9070
    return (
      <ThemeProvider theme={theme}>
        <Head>
          <script async src={MODULE_URL} />
        </Head>
        <Page>
          <Page.Navbar />
          <Page.Body>
            <div className="container">
              <div className="row">
                <div className="col col-xs-12">
                  <h1>Checkout with Daisy</h1>
                </div>
              </div>

              <div className="row">
                <div className="col col-xs-6">
                  <InputControl>
                    <Input>
                      <Input.Text onChange={this.handleInvoiceChange} />
                      <Input.Label>Invoice Identifier</Input.Label>
                    </Input>
                  </InputControl>
                </div>
                <div className="col col-xs-6">
                  {this.state.invoiceIdentifier && (
                    <div
                      id="daisy-payment-module"
                      data-invoice={this.state.invoiceIdentifier}
                      data-override_host="http://0.0.0.0:5000"
                    />
                  )}
                </div>
              </div>
            </div>
          </Page.Body>
        </Page>
      </ThemeProvider>
    );
  }
}

export default withSSR()(StoreCheckoutWithPaymentModule);
