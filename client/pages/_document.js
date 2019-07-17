import React from "react";
import Document, { Head, Main, NextScript } from "next/document"; // eslint-disable-line no-shadow
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  // https://github.com/zeit/next.js/tree/canary/examples/with-styled-components
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <html lang="en" prefix="og: http://ogp.me/ns#">
        <Head>{this.props.styleTags}</Head>
        <Main />
        <NextScript />
      </html>
    );
  }
}
