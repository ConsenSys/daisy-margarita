import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import isEmpty from "lodash/isEmpty";

import { withSSR } from "koa-nextjs/react";

class Error400 extends PureComponent {
  static propTypes = {
    statusCode: PropTypes.number,
    error: PropTypes.string,
    message: PropTypes.string,
    stack: PropTypes.string,
    data: PropTypes.object,
  };

  static defaultProps = {
    statusCode: 400,
    error: "Bad Request",
    message: "User Error",
    stack: null,
    data: null,
  };

  render() {
    const { statusCode, error, message, stack, data, ...props } = this.props;

    return (
      <div {...props}>
        <div>
          <h1>Something Happened</h1>

          <h1>
            Error {String(statusCode)}: {error}
          </h1>
          {!isEmpty(data) && <pre>{JSON.stringify(data, null, 2)}</pre>}
          <p>{message}</p>
          {stack && (
            <pre>
              # stacktree (dev only)
              <br />
              {stack}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

export default withSSR()(Error400);
