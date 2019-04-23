import React from "react";

import MetaMaskContext from "../addons/metamask";

const Navbar = ({ user, ...props }) => (
  <nav
    style={{ marginBottom: "1em" }}
    className="navbar navbar-expand-lg navbar-light bg-light"
    {...props}
  >
    <a className="navbar-brand" href="/">
      Margarita.io
    </a>
    <button
      className="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarText"
      aria-controls="navbarText"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon" />
    </button>
    <div className="collapse navbar-collapse" id="navbarText">
      <ul className="navbar-nav mr-auto">
        <li className="nav-item active">
          <a className="nav-link" href="/">
            Home
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/about/">
            About
          </a>
        </li>
      </ul>

      <ul className="navbar-nav ml-auto">
        <MetaMaskContext.Consumer>
          {({ web3, accounts, error, awaiting, openMetaMask }) => (
            <li className="nav-item">
              {!error && web3 && accounts.length && (
                <a className="nav-link" href="#" onClick={openMetaMask}>
                  {awaiting && "⟳ "}
                  <code>{accounts[0]}</code> 🦊
                </a>
              )}
              {!error && web3 && accounts.length === 0 && (
                <a className="nav-link" href="#" onClick={openMetaMask}>
                  No Wallet 🦊
                </a>
              )}
              {!error && !web3 && awaiting && (
                <a className="nav-link" href="#" onClick={openMetaMask}>
                  MetaMask loading...
                </a>
              )}
              {!error && !web3 && !awaiting && (
                <a className="nav-link" href="#" onClick={openMetaMask}>
                  Please open and allow MetaMask
                </a>
              )}
              {error && error.notInstalled && (
                <a
                  className="nav-link"
                  href="https://metamask.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Install MetaMask
                </a>
              )}
              {error && !error.notInstalled && (
                <a className="nav-link" href="#" onClick={openMetaMask}>
                  {error.message}
                </a>
              )}
            </li>
          )}
        </MetaMaskContext.Consumer>
        {user ? (
          <>
            <li className="nav-item active">
              <a className="nav-link" href="/account/">
                Account for {user["name"]}
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/session/logout/">
                Logout
              </a>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <a className="nav-link" href="/session/login/">
                Login
              </a>
            </li>
          </>
        )}
      </ul>
    </div>
  </nav>
);

export default Navbar;
