import * as React from 'react';
import { Middleware } from 'redux';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';
import { ConnectedRouter, connectRouter } from 'connected-react-router';
import { Switch } from 'react-router-dom';
import { Persistor } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { routerMiddlewares, createHistory, RouteConfigs } from './router';

import { configureStore, ReduxConfigs } from './redux';
import { run as runSubscription } from './redux/subscription';
import createPromiseMiddleware from './redux/createPromiseMiddleware';

import { Feature } from './connector';
import { configureClient, GraphqlConfigs } from './apollo';

export { default as Feature, Module } from './connector';
export const { default: redux, createReduxStore } = require('./redux');
export const { default: apollo, createApolloClient: createClient } = require('./apollo');

export { PrivateRoute, Route } from './router';

export type AppX = {
  modules: Feature;
};

export type InitialState = {
  [key: string]: any;
};

interface Options {
  modules: Feature;
  initialState: any;
  middlewares: Middleware[];
  routeConfigs?: RouteConfigs;
  graphqlConfigs: GraphqlConfigs;
  reduxConfigs?: ReduxConfigs;
  onError: (error: Error) => void;
  onLoad: (app: AppX) => void;
}

export default (options: Options) => {
  const {
    modules,
    initialState = {},
    middlewares = [],
    routeConfigs,
    graphqlConfigs,
    reduxConfigs,
    onError = () => {},
    onLoad = () => {}
  } = options;
  const app: AppX = { modules };
  const history = createHistory(routeConfigs || {});

  const { routes, reducers, effects } = modules;
  const { middleware: promiseMiddleware, resolve, reject } = createPromiseMiddleware(app);

  const store = configureStore(
    reducers,
    initialState,
    [...middlewares, ...routerMiddlewares(history), promiseMiddleware],
    { ...reduxConfigs, connectRouter: connectRouter(history) }
  );
  store.then(() => {
    // Run sagas
    const sagas = effects(resolve, reject, onError);
    sagas.forEach(store.runSaga);
    // Run subscriptions
    for (const module of modules) {
      if (module.subscriptions) {
        runSubscription(module.subscriptions, module, store, onError);
      }
    }
    onLoad(app);
  });

  const client = configureClient(graphqlConfigs);

  return class App extends React.Component {
    componentWillMount() {
      console.log('app is running.');
    }

    render() {
      return (
        <Provider store={store}>
          <PersistGate loading={null} persistor={store.persistor}>
            <ApolloProvider client={client}>
              <ConnectedRouter history={history}>
                <Switch>{routes.map(component => React.cloneElement(component, { key: component.props.path }))}</Switch>
              </ConnectedRouter>
            </ApolloProvider>
          </PersistGate>
        </Provider>
      );
    }
  };
};
