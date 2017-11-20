import React from 'react';
import { Provider } from 'react-redux';

import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import defaultMiddleware from './middleware';

function getDebugSessionKey() {
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return matches && matches.length > 0 ? matches[1] : null;
}

const initialState = {};

let store: any;

export const createReduxStore = (reducers = {}, initialState = {}, middlewares = [], { debug = false }) => {
  if (store) {
    store.replaceReducer(combineReducers(reducers));
    return store;
  }
  if (!debug || !window.devToolsExtension) {
    return createStore(
      combineReducers(reducers),
      initialState,
      applyMiddleware(...defaultMiddleware.concat(...middlewares))
    );
  }
  const persistState = require('redux-devtools').default;
  return createStore(
    combineReducers(reducers),
    initialState,
    compose(
      applyMiddleware(...defaultMiddleware.concat(...middlewares)),
      window.devToolsExtension(),
      persistState(getDebugSessionKey())
    )
  );
};

export default function withRedux({ store: externalStore, middlewares = [], reducers = {}, debug = false }) {
  if (!externalStore) {
    store = createReduxStore(reducers, initialState, middlewares, { debug });
  } else {
    store = externalStore;
  }
  return WrappedComponent => () => {
    if (debug && !window.devToolsExtension) {
      return (
        <Provider store={store}>
          <DevTools store={store} />
          <WrappedComponent store={store} />
        </Provider>
      );
    }
    return (
      <Provider store={store}>
        <WrappedComponent store={store} />
      </Provider>
    );
  };
}
