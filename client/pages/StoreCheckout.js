import React, { useState } from "react";
import PropTypes from "prop-types";
import { withSSR } from "koa-nextjs/react";

import { Page } from "../components";

import { withMetaMaskContext } from "../addons/metamask";

function StoreCheckout({
  invoice,
  order: {
    total: [total, symbol],
  },
  ...props
}) {
  const [showMore, showMoreSet] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    window.location = invoice["shareURL"];
  }

  return (
    <Page>
      <Page.Navbar {...props} />
      <Page.Body>
        <form className="container" onSubmit={handleSubmit}>
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
              <button className="btn btn-primary" type="submit">
                Pay with Daisy
              </button>
              <br />
              <a href="#" onClick={() => showMoreSet(!showMore)}>
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

StoreCheckout.propTypes = {
  products: PropTypes.array.isRequired,
  order: PropTypes.shape({
    cart: PropTypes.any,
    total: PropTypes.array,
  }).isRequired,
  invoice: PropTypes.any.isRequired,
};

export default withSSR()(StoreCheckout);
