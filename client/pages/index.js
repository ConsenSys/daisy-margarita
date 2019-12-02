import React, { PureComponent } from "react";
import { withSSR } from "koa-nextjs/react";

import { Page } from "../components";

class Index extends PureComponent {
  state = {};

  render() {
    return (
      <Page>
        <Page.Navbar {...this.props} />
        <Page.Body>
          <Page.Body>
            <div className="container">
              <div className="jumbotron">
                <h1 className="display-4">Hello, Margarita!</h1>
                <p className="lead">Subscribe to get access to our platform</p>
                <hr className="my-4" />
                <p>
                  {" "}
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur.
                </p>
                <a
                  className="btn btn-primary btn-lg"
                  href="/about/"
                  role="button"
                >
                  Learn more
                </a>
              </div>
              <div className="row">
                <div className="col col-xs-12">
                  <div className="card text-center">
                    <div className="card-body">
                      <h5 className="card-title">Premium products</h5>
                      <a href="/store" className="btn btn-primary">
                        Go shopping
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <br />
              <div className="row">
                <div className="col col-xs-12 col-sm-4">
                  <div className="card text-center">
                    <div className="card-header">Basic Plan</div>
                    <div className="card-body">
                      <h5 className="card-title">
                        For small teams and starting users
                      </h5>
                      <p className="card-text">
                        With supporting text below as a natural lead-in to
                        additional content.
                      </p>
                      <a href="#" className="btn btn-primary disabled">
                        Subscribe
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col col-xs-12 col-sm-4">
                  <div className="card text-center">
                    <div className="card-header">PRO Plan</div>
                    <div className="card-body">
                      <h5 className="card-title">For established teams</h5>
                      <p className="card-text">
                        With supporting text below as a natural lead-in to
                        additional content.
                      </p>
                      <a
                        href="/subscriptions/new?plan=cGxhbjoxMw=="
                        className="btn btn-primary"
                      >
                        Subscribe
                      </a>
                    </div>
                    <div className="card-footer text-muted">MOST POPULAR</div>
                  </div>
                </div>
                <div className="col col-xs-12 col-sm-4">
                  <div className="card text-center">
                    <div className="card-header">Enterprise Plan</div>
                    <div className="card-body">
                      <h5 className="card-title">For large business</h5>
                      <p className="card-text">
                        With supporting text below as a natural lead-in to
                        additional content.{" "}
                        <strong>Requires activation code.</strong>
                      </p>
                      <a
                        href="/subscriptions/new?plan=p2"
                        className="btn btn-secondary"
                      >
                        Subscribe
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <hr style={{ margin: "4em 0" }} />
            </div>
          </Page.Body>
        </Page.Body>
      </Page>
    );
  }
}

export default withSSR()(Index);
