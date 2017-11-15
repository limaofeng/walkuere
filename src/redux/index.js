import React from 'react';
import Immutable from 'immutable';
import { Provider } from 'react-redux';

import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { persistState } from 'redux-devtools';
import defaultMiddleware from './middleware';
import DevTools from './DevTools';

function getDebugSessionKey() {
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return matches && matches.length > 0 ? matches[1] : null;
}

const initialState = Immutable.Map();

let store: any;

export const createReduxStore = (reducers = {},state = {}, middlewares = [],  { debug }) => {
  if (store) {
    store.replaceReducer(combineReducers(reducers));
    return store;
  }
  if (!debug) {
    return createStore(
      combineReducers(reducers),
      initialState,
      applyMiddleware(defaultMiddleware.concat(...middlewares))
    );
  }
  return createStore(
    combineReducers(reducers),
    {},
    compose(
      applyMiddleware(defaultMiddleware.concat(...middlewares)),
      window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState(getDebugSessionKey())
    )
  );
};

export default function withRedux({ store: externalStore, middlewares = [], reducers = {}, debug = false }) {
  if (!externalStore) {
    store = createReduxStore(middlewares, reducers, debug);
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
