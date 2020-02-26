import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withSSR } from "koa-nextjs/react";

import { Page } from "../components";
import client from "../addons/client";
import { REDIRECT } from "../addons/url";

function calculatePrice(products, cart) {
  const token = "DAI";
  let total = 0;
  // eslint-disable-next-line no-unused-vars
  for (const [id, amount] of Object.entries(cart)) {
    const product = products.find(p => String(p["id"]) === String(id));
    const [price] = product["price"];
    total += Number(price) * Number(amount || 0);
  }
  return [total, token];
}

class Store extends PureComponent {
  static propTypes = {
    products: PropTypes.array.isRequired,
  };

  state = {
    cart: {},
  };

  handleChange = (product, { target: { value } }) => {
    this.setState(({ cart }) => ({
      cart: { ...cart, [product["id"]]: value },
    }));
  };

  handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await client.POST("/api/store/checkout/", {
        cart: this.state.cart,
      });
      REDIRECT(`/store/checkout/${data["order"]["id"]}`);
    } catch (error) {
      alert(error);
    }
  };

  render() {
    const { products, ...props } = this.props;
    const { cart } = this.state;

    const [total, symbol] = calculatePrice(products, cart);

    return (
      <Page>
        <Page.Navbar {...props} />
        <Page.Body>
          <form className="container" onSubmit={this.handleSubmit}>
            <div className="row">
              <div className="col col-xs-12">
                <h1>Store</h1>
              </div>
            </div>

            {products.map(product => (
              <div key={product["id"]} className="card container">
                <dl className="row">
                  <dt className="col col-sm-3">Name</dt>
                  <dd className="col col-sm-9">{product["name"]}</dd>
                  <dt className="col col-sm-3">Price</dt>
                  <dd className="col col-sm-9">{product["price"].join(" ")}</dd>
                  <dt className="col col-sm-3">Amount</dt>
                  <dd className="col col-sm-9">
                    <input
                      type="number"
                      min="0"
                      value={cart[product["id"]] || ""}
                      placeholder="0"
                      onChange={e => this.handleChange(product, e)}
                    />
                  </dd>
                </dl>
              </div>
            ))}

            <div className="row">
              <div className="col col-xs-12">
                <p>
                  Total: {total.toFixed(0)} {symbol}
                </p>
                <button className="btn btn-primary" type="submit" disabled={total <= 0.01}>
                  Checkout
                </button>
              </div>
            </div>
          </form>
        </Page.Body>
      </Page>
    );
  }
}

export default withSSR()(Store);
