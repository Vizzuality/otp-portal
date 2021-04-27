/**
 * Creating a page named _error.js lets you override HTTP error messages
 */
import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Link from 'next/link';

class ErrorPage extends React.Component {

  static getInitialProps({ res, xhr, url }) {
    const errorCode = res ? res.statusCode : xhr.status;
    return { errorCode, url };
  }

  render() {
    const css = (
      <Head>
        <style>{`
          body {
            margin: 10px 20px;
            font-family: sans-serif;
            color: #444;
            background-color: #eee;
          }
        `}</style>
      </Head>
    );

    let response;
    switch (this.props.errorCode) {
      case 200: // Also display a 404 if someone requests /_error explicitly
      case 404:
        response = (
          <div>
            {css}
            <h1>Page Not Found</h1>
            <p>The page <strong>{ this.props.url.pathname }</strong> does not exist.</p>
            <p><Link href="/"><a>Home</a></Link></p>
          </div>
        );
        break;
      case 500:
        response = (
          <div>
            {css}
            <h1>Internal Server Error</h1>
            <p>An internal server error occurred.</p>
          </div>
        );
        break;
      default:
        response = (
          <div>
            {css}
            <h1>HTTP { this.props.errorCode } Error</h1>
            <p>
              An <strong>HTTP { this.props.errorCode }</strong> error occurred while
              trying to access <strong>{ this.props.url.pathname }</strong>
            </p>
          </div>
        );
    }

    return response;
  }

}

ErrorPage.propTypes = {
  errorCode: PropTypes.number.isRequired,
  url: PropTypes.object.isRequired
};

export default ErrorPage;
