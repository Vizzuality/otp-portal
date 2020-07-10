import React from 'react';
import { Provider } from 'react-redux';
import App from 'next/app';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import withRedux from 'next-redux-wrapper'; // eslint-disable-line import/extensions

import * as reducers from 'modules';

import { setUser } from 'modules/user';
import { setRouter } from 'modules/router';
import { setLanguage } from 'modules/language';
import { getOperators } from 'modules/operators';

const reducer = combineReducers({
  ...reducers
});

const makeStore = (initialState = {}) =>
  createStore(
    reducer,
    initialState,
    compose(
      applyMiddleware(thunk),
      /* Redux dev tool, install chrome extension in
       * https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en */
      typeof window === 'object' &&
        typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
    )
  );

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const { asPath, pathname, query, isServer, req, store } = ctx;
    const state = store.getState();
    const url = { asPath, pathname, query };
    let user = null;
    let lang = 'en';

    if (isServer) {
      lang = req.locale.language;
      user = req.session ? req.session.user : {};
    } else {
      lang = state.language;
      user = state.user;
    }

    store.dispatch(setLanguage(lang));
    store.dispatch(setUser(user));
    store.dispatch(setRouter(url));

    if (!state.operators.data.length) {
      await store.dispatch(getOperators());
    }

    const pageProps = Component.getInitialProps ?
      await Component.getInitialProps({ ...ctx, url }) :
      {};

    return { pageProps };
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    );
  }

}

export default withRedux(makeStore)(MyApp);
