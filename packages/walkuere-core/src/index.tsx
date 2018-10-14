import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import { AnyAction, Dispatch, Middleware } from 'redux';
import { PersistGate } from 'redux-persist/integration/react';

import { Feature } from './connector';

export { default as Feature, Module, InAction, PubReducer } from './connector';
export { default as redux, configureStore, ReduxConfigs, createPromiseMiddleware, runSubscription } from './redux';
export { default as apollo, configureClient, GraphqlConfigs } from './apollo';

export interface Application {
  modules: Feature;
}

export interface InitialState {
  [key: string]: any;
}
