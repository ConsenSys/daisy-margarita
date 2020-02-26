import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { withSSR } from "koa-nextjs/react";

import { Page } from "../components";
import client from "../addons/client";

export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      // tick(); // immediate tick
      return () => clearInterval(id);
    }
  }, [delay]);
}

function StoreCheckoutSuccess({ invoice: defaultInvoice, order: defaultOrder, ...props }) {
  const [invoice, invoiceSet] = useState(defaultInvoice);
  const [order, orderSet] = useState(defaultOrder);
  const [showMore, showMoreSet] = useState(false);

  const {
    id,
    total: [total, symbol],
  } = order;

  useInterval(async function watch() {
    const { data } = await client.GET(`/api/store/checkout/${id}/`);
    invoiceSet(data["invoice"]);
    orderSet(data["order"]);
  }, 3000);

  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <Page>
      <Page.Navbar {...props} />
      <Page.Body>
        <form className="container" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col col-xs-12">
              <h1>Order status:</h1>
            </div>
          </div>

          <div className="row">
            <div className="col col-xs-12">
              <p>
                Total: {total.toFixed(0)} {symbol}
              </p>
              <p>Status: {invoice["state"]}</p>
              <br />
              <a href="#" onClick={() => showMoreSet(!showMore)}>
                Toggle more info
              </a>
              {showMore && <pre>{JSON.stringify(order, null, 2)}</pre>}
              <br />
              {showMore && <pre>{JSON.stringify(invoice, null, 2)}</pre>}
            </div>
          </div>
        </form>
      </Page.Body>
    </Page>
  );
}

StoreCheckoutSuccess.propTypes = {
  order: PropTypes.shape({
    cart: PropTypes.any,
    total: PropTypes.array,
  }).isRequired,
  invoice: PropTypes.any.isRequired,
};

export default withSSR()(StoreCheckoutSuccess);
