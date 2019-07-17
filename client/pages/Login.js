import React, { PureComponent } from "react";
import { withSSR } from "koa-nextjs/react";

import { Page } from "../components";
import client from "../addons/client";
import { REDIRECT } from "../addons/url";

const EMAIL = "admin@daisypayments.com";
const PASSWORD = "12345678";

class Login extends PureComponent {
  state = {
    email: "",
    password: "",
  };

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  handleSubmit = async e => {
    e.preventDefault();
    try {
      await client.POST("/api/session/login", this.state);
      REDIRECT("/");
    } catch (error) {
      alert(error);
    }
  };

  render() {
    return (
      <Page>
        <Page.Navbar {...this.props} />
        <Page.Body>
          <div className="container">
            <h1>Login</h1>
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label htmlFor="exampleInputEmail1">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
                  placeholder="Enter email"
                  name="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                />
                <small id="emailHelp" className="form-text text-muted">
                  Tip: use{" "}
                  <code
                    style={{ cursor: "pointer" }}
                    onClick={() => this.setState({ email: EMAIL })}
                  >
                    {EMAIL}
                  </code>
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="exampleInputPassword1">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="exampleInputPassword1"
                  placeholder="Password"
                  name="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                />
                <small id="passwordHelp" className="form-text text-muted">
                  Tip: use{" "}
                  <code
                    style={{ cursor: "pointer" }}
                    onClick={() => this.setState({ password: PASSWORD })}
                  >
                    {PASSWORD}
                  </code>
                </small>
              </div>

              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </div>
        </Page.Body>
      </Page>
    );
  }
}

export default withSSR()(Login);
