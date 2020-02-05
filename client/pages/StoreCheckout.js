import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withSSR } from "koa-nextjs/react";
import DaisySDK from "@daisypayments/daisy-sdk";

import { Page } from "../components";
import client from "../addons/client";
import { withMetaMaskContext } from "../addons/metamask";

const SDK_DEV = {
  // baseURL: "https://sdk.staging.daisypayments.com/",
  baseURL: "http://localhost:8000",
  // baseURL: "http://167.172.238.224:8000",
};

class StoreCheckout extends PureComponent {
  static propTypes = {
    products: PropTypes.array.isRequired,
    order: PropTypes.shape({
      cart: PropTypes.any,
      total: PropTypes.array,
    }).isRequired,
    invoice: PropTypes.any.isRequired,
    metamask: PropTypes.object.isRequired,
  };

  static defaultProps = {};

  state = {
    invoice: this.props.invoice,
    receipts: [],
    transaction: null,
  };

  polling = null;

  componentDidMount() {
    this.handlePolling();
    this.polling = setInterval(this.handlePolling, 3000);
  }

  handlePolling = async () => {
    const {
      order: { id },
    } = this.props;
    try {
      const { data } = await client.GET(`/api/store/checkout/${id}/`);

      this.setState({
        invoice: data["invoice"],
        receipts: data["receipts"],
      });
    } catch (error) {
      console.error("ERROR:", error);
    }
  };

  handleSubmit = async e => {
    e.preventDefault();

    const {
      invoice,
      metamask: {
        accounts: [account],
        web3,
      },
    } = this.props;

    const daisy = await DaisySDK.initPayments({
      manager: {
        identifier: this.props.identifier,
      },
      override: SDK_DEV,
      withGlobals: { web3 },
    });

    const transaction = await daisy
      .with(invoice)
      .pay(invoice, { from: account });
    console.log(transaction);
    this.setState({ transaction });
  };

  render() {
    const {
      order: {
        total: [total, symbol],
      },
      ...props
    } = this.props;
    const { invoice, receipts, transaction, showMore } = this.state;

    return (
      <Page>
        <Page.Navbar {...props} />
        <Page.Body>
          <form className="container" onSubmit={this.handleSubmit}>
            <div className="row">
              <div className="col col-xs-12">
                <h1>Checkout</h1>
              </div>
            </div>

            <div className="row">
              <div className="col col-xs-12">
                <p>
                  Total: {total.toFixed(0)} {symbol}
                </p>
                <p>Status: {invoice["state"]}</p>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={Boolean(transaction)}
                >
                  Checkout
                </button>
                <ul>
                  {receipts.map(r => (
                    <li key={r["id"]}>Receipt: {r["txHash"]}</li>
                  ))}
                </ul>
                <a
                  href="#"
                  onClick={() =>
                    this.setState(state => ({ showMore: !state.showMore }))
                  }
                >
                  Toggle more info
                </a>
                {showMore && <pre>{JSON.stringify(invoice, null, 2)}</pre>}
              </div>
            </div>
          </form>
        </Page.Body>
      </Page>
    );
  }
}

export default withSSR()(withMetaMaskContext(StoreCheckout));
