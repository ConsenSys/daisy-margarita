/* eslint camelcase:0, no-restricted-globals:0 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import styled, { keyframes } from "styled-components";
import { withSSR } from "koa-nextjs/react";
import DaisySDK from "@daisypayments/daisy-sdk";

import client from "../addons/client";
import { withMetaMaskContext } from "../addons/metamask";
import { Page } from "../components";

const SDK_DEV = {
  baseURL: "https://sdk.staging.daisypayments.com/",
  // baseURL: "http://localhost:8000",
  // baseURL: "http://167.172.238.224:8000",
};

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

// Here we create a component that will rotate everything we pass in over two seconds
const Rotate = styled.div`
  display: inline-block;
  animation: ${rotate} 2s linear infinite;
  font-size: 1.2rem;
`;

const Item = styled.div`
  color: ${props => (props.disabled ? "lightgray !important" : undefined)};
`;

const CONFIRMATIONS = 6;

const STATUS = {
  NOT_STARTED: "NOT_STARTED",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

const update = (array, index, fn) => [
  ...array.slice(0, index),
  fn(array[index]),
  ...array.slice(index + 1),
];

const StatusBadge = ({ status, ...props }) => {
  switch (status) {
    case STATUS.NOT_STARTED:
      return (
        <span {...props} className="badge badge-secondary">
          Not Started
        </span>
      );
    case STATUS.PROCESSING:
      return (
        <>
          <span {...props} className="badge badge-warning">
            Processing
          </span>
          <Rotate style={{ marginLeft: "3px" }} role="img">
            🌼
          </Rotate>
        </>
      );
    case STATUS.SUCCESS:
      return (
        <span {...props} className="badge badge-primary">
          Success
        </span>
      );
    case STATUS.FAILED:
      return (
        <span {...props} className="badge badge-danger">
          Failed
        </span>
      );

    default:
      return null;
  }
};

class Subscribe extends Component {
  static propTypes = {
    steps: PropTypes.array,
    plan: PropTypes.object.isRequired,
    subscription: PropTypes.object.isRequired,
    manager: PropTypes.object.isRequired,
    metamask: PropTypes.object,
  };

  static defaultProps = {
    steps: [
      {
        step: 0,
        status: STATUS.NOT_STARTED,
        confirmationNumber: 0,
        receipt: null,
        hash: null,
        error: null,
      },
      {
        step: 1,
        status: STATUS.NOT_STARTED,
        error: null,
      },
    ],
    metamask: null,
  };

  state = {
    steps: this.props.steps,
    periods: Infinity,
    amount: `1000${"0".repeat(18)}`,
    daisy: null,
    code: "PROMO_CODE",
    // beneficiary: null, // accounts[0]
  };

  polling = null;

  componentDidMount() {
    const {
      metamask: { web3 },
      subscription: { receipt },
    } = this.props;

    if (web3 && receipt) {
      this.attachToTransaction(web3, receipt);
    }

    this.handlePolling();
    this.polling = setInterval(this.handlePolling, 3000);
  }

  componentWillReceiveProps(nextProps) {
    const {
      metamask: { web3 },
      subscription: { receipt },
    } = nextProps;

    if (web3 && receipt) {
      this.attachToTransaction(web3, receipt);
    }
  }

  componentWillUnmount() {
    clearInterval(this.polling);
  }

  handleCancel = async () => {
    const {
      web3,
      accounts: [account],
    } = this.props.metamask;

    const daisy = await DaisySDK.initSubscriptions({
      manager: this.props.manager,
      override: SDK_DEV,
      withGlobals: { web3 },
    });
    const token = daisy.loadToken(this.props.plan);

    const { signature, agreement } = await daisy
      .prepareToken(token)
      .signCancel({
        account,
        onChainId: this.state.daisy["onChainId"],
        signatureExpiresAt: Number.MAX_SAFE_INTEGER,
      });

    const data = await daisy.submitCancel({ agreement, signature });
    console.log(data);
  };

  handlePolling = async () => {
    const {
      subscription: { id },
    } = this.props;
    try {
      const { data } = await client.GET(`/api/subscriptions/${id}/`);
      this.setState({ daisy: data });
    } catch (error) {
      console.error("ERROR:", error);
    }
  };

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  handleTogglePeriods = () =>
    this.setState(state => ({
      periods: state.periods === Infinity ? 1 : Infinity,
    }));

  handleApprove = async (web3, address) => {
    const amount = this.state.amount;

    this.setState(state => ({
      steps: update(state.steps, 0, step => ({
        ...step,
        status: STATUS.NOT_STARTED,
        confirmationNumber: 0,
        receipt: null,
        hash: null,
        error: null,
      })),
    }));

    const daisy = new DaisySDK(this.props.manager, web3, SDK_DEV);
    const token = daisy.loadToken(this.props.plan);

    this.eventemitter = daisy
      .prepareToken(token)
      .approve(amount, { from: address });

    this.eventemitter
      .on("transactionHash", this.handleApprove_transactionHash)
      .on("confirmation", this.handleApprove_confirmation)
      .on("receipt", this.handleApprove_receipt)
      .on("error", this.handleApprove_error);
  };

  handleApprove_transactionHash = transactionHash => {
    this.setState(state => ({
      steps: update(state.steps, 0, step => ({
        ...step,
        status: STATUS.PROCESSING,
        hash: transactionHash,
        error: null,
      })),
    }));
  };

  handleApprove_confirmation = (confirmationNumber, receipt) => {
    this.setState(state => ({
      steps: update(state.steps, 0, step => ({
        ...step,
        status:
          confirmationNumber >= CONFIRMATIONS
            ? STATUS.SUCCESS
            : STATUS.PROCESSING,
        confirmationNumber,
        receipt,
        error: null,
      })),
    }));
  };

  handleApprove_receipt = async receipt => {
    try {
      await client.POST(`/api/subscriptions/${this.props.subscription["id"]}`, {
        receipt,
      });
    } catch (error) {
      console.error(error);
    }
  };

  handleApprove_error = error => {
    this.setState(state => ({
      steps: update(state.steps, 0, step => ({
        ...step,
        status: STATUS.FAILED,
        error,
      })),
    }));
  };

  handleSign = async (web3, account) => {
    this.setState(state => ({
      steps: update(state.steps, 1, step => ({
        ...step,
        status: STATUS.PROCESSING,
        error: null,
      })),
    }));

    const daisy = new DaisySDK(this.props.manager, web3, SDK_DEV);
    const token = daisy.loadToken(this.props.plan);

    try {
      const { signature, agreement } = await daisy.prepareToken(token).sign({
        account,
        plan: this.props.plan,
        signatureExpiresAt: Number.MAX_SAFE_INTEGER, // DEV ONLY
      });

      this.setState(state => ({
        steps: update(state.steps, 1, step => ({
          ...step,
          signature,
          agreement,
          error: null,
        })),
      }));

      await client.POST(`/api/subscriptions/${this.props.subscription["id"]}`, {
        agreement,
        receipt: this.state.steps[0].receipt,
        signature,
        code: this.state.code,
      });

      this.setState(state => ({
        steps: update(state.steps, 1, step => ({
          ...step,
          status: STATUS.SUCCESS,
        })),
      }));
    } catch (error) {
      console.error(error);
      this.setState(state => ({
        steps: update(state.steps, 1, step => ({
          ...step,
          status: STATUS.FAILED,
          error,
        })),
      }));
    }
  };

  attachToTransaction = async (web3, receipt) => {
    const daisy = new DaisySDK(this.props.manager, web3, SDK_DEV);
    const token = daisy.loadToken(this.props.plan);

    this.eventemitter = await daisy.prepareToken(token).resume(receipt);

    this.eventemitter
      .on("transactionHash", this.handleApprove_transactionHash)
      .on("confirmation", this.handleApprove_confirmation)
      .on("receipt", this.handleApprove_receipt)
      .on("error", this.handleApprove_error);
  };

  render() {
    const {
      plan,
      subscription,
      metamask: { web3, accounts, error },
      ...props
    } = this.props;
    const { steps, daisy } = this.state;

    return (
      <Page>
        <Page.Navbar {...props} />
        <Page.Body>
          <div className="container">
            <h1>
              Subscribe to <em>{plan["name"]}</em>
              {plan["private"] && (
                <span className="badge badge-secondary">Enterprise</span>
              )}
            </h1>
            <p className="lead">
              Subscription bill id: <code>{subscription["id"]}</code>
            </p>
            {daisy && !daisy["error"] && <p>Status: {daisy["state"]}</p>}
            {daisy && daisy["error"] && (
              <p>
                Status: {daisy["state"]}, Error: {daisy["error"]}
              </p>
            )}
            {!daisy && <p>Not created yet</p>}
            <button onClick={this.handleCancel}>Cancel</button>
          </div>
          <div className="container">
            <Item
              className="card mb-3"
              disabled={steps[0].status === STATUS.SUCCESS}
            >
              <div className="card-body">
                <StatusBadge status={steps[0].status} />
                <h5 className="card-title">Approval</h5>
                <p className="card-text">
                  Send a transaction to the ERC20 contract to allow us to
                  receive tokens.
                </p>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    this.handleApprove(web3, accounts[0]);
                  }}
                >
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label htmlFor="amount">Amount:</label>
                      <input
                        type="text"
                        value={this.state.amount}
                        className="form-control"
                        id="amount"
                        onChange={e =>
                          this.setState({ amount: e.target.value })
                        }
                        placeholder="Amount of tokens to approve"
                      />
                      <small className="form-text text-muted">
                        Use MetaMask to select the account you want to use to
                        pay
                      </small>
                    </div>
                    {plan["private"] && (
                      <div className="form-group col-md-6">
                        <label htmlFor="code">Code:</label>
                        <input
                          type="text"
                          value={this.state.code}
                          className="form-control"
                          id="code"
                          onChange={e =>
                            this.setState({
                              code: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="PROMO_CODE"
                        />
                        <small className="form-text text-muted">
                          Contact our sales teams to get the access code for
                          this enterprise plan.
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label htmlFor="chargeTo">Charge To:</label>
                      <input
                        type="text"
                        value={accounts[0] || ""}
                        className="form-control"
                        id="chargeTo"
                        placeholder="Ethereum Address"
                        readOnly
                      />
                      <small className="form-text text-muted">
                        Use MetaMask to select the account you want to use to
                        pay
                      </small>
                    </div>
                    <div className="form-group col-md-6">
                      <label htmlFor="beneficiary">Beneficiary:</label>
                      <input
                        type="text"
                        value={accounts[0] || ""}
                        className="form-control"
                        id="beneficiary"
                        placeholder="Ethereum Address"
                        readOnly
                      />
                      <small className="form-text text-muted">
                        Beneficiary of the subscription
                      </small>
                    </div>
                  </div>

                  <p>
                    <strong>
                      At any moment you still have absolute control of your
                      tokens
                    </strong>{" "}
                    and you only going to be charged at the beginning of each
                    period.
                  </p>

                  <button
                    style={{ backgroundColor: "#E67C19" }}
                    type="submit"
                    disabled={Boolean(
                      !web3 || error || steps[0].status !== STATUS.NOT_STARTED,
                    )}
                    className={`btn btn-primary ${(!web3 ||
                      error ||
                      steps[0].status !== STATUS.NOT_STARTED) &&
                      "disabled"}`}
                  >
                    {steps[0].status === STATUS.NOT_STARTED &&
                      "Approve with MetaMask"}
                    {steps[0].status === STATUS.PROCESSING &&
                      steps[0].confirmationNumber === 0 &&
                      `Processing...`}
                    {steps[0].status === STATUS.PROCESSING &&
                      steps[0].confirmationNumber > 0 &&
                      `Processing (${steps[0].confirmationNumber}/${CONFIRMATIONS})`}
                    {steps[0].status === STATUS.SUCCESS && "Success!"}
                  </button>
                </form>
                {steps[0].receipt && (
                  <pre>{JSON.stringify(steps[0].receipt, null, 2)}</pre>
                )}
                <p className="card-text">
                  <small className="text-muted">
                    {`This will consume some gas, but we promise it's gonna be
                    cheap`}
                  </small>
                </p>
              </div>
            </Item>
            <Item
              className="card mb-3"
              disabled={
                steps[0].status !== STATUS.SUCCESS ||
                steps[1].status === STATUS.SUCCESS
              }
            >
              <div className="card-body">
                <StatusBadge status={steps[1].status} />
                <h5 className="card-title">Payment signature</h5>
                <p className="card-text">
                  This signature allow us to charge the subscription cost.
                </p>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    return this.handleSign(web3, accounts[0]);
                  }}
                >
                  <div className="form-row">
                    <div className="form-group">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          disabled
                          checked={this.state.periods === Infinity}
                          onChange={this.handleTogglePeriods}
                          id="periods"
                        />
                        <label className="form-check-label" htmlFor="periods">
                          Renew indefinitely
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={Boolean(
                      !web3 || steps[1].status !== STATUS.NOT_STARTED,
                    )}
                    className={`btn btn-primary ${(!web3 ||
                      steps[1].status !== STATUS.NOT_STARTED) &&
                      "disabled"}`}
                  >
                    {steps[1].status !== STATUS.SUCCESS &&
                      "Sign agreement & submit"}
                    {steps[1].status === STATUS.SUCCESS && "Success!"}
                  </button>
                  {steps[1].signature && (
                    <pre>{JSON.stringify(steps[1].signature, null, 2)}</pre>
                  )}
                  <p className="card-text">
                    <small className="text-muted">No gas involved!</small>
                  </p>
                </form>
              </div>
            </Item>
          </div>
        </Page.Body>
      </Page>
    );
  }
}

export default withSSR()(withMetaMaskContext(Subscribe));
