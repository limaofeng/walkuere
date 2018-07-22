import { ConnectedRouter, connectRouter } from 'connected-react-router';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import { Switch } from 'react-router-dom';
import { Middleware } from 'redux';
import { PersistGate } from 'redux-persist/integration/react';

import { createHistory, RouteConfigs, routerMiddlewares } from './router';

import { configureStore, ReduxConfigs } from './redux';
import createPromiseMiddleware from './redux/createPromiseMiddleware';
import { run as runSubscription } from './redux/subscription';

import { configureClient, GraphqlConfigs } from './apollo';
import { Feature } from './connector';

export { default as Feature, Module } from './connector';
export { default as redux, configureStore } from './redux';
export { default as apollo, configureClient } from './apollo';

export { PrivateRoute, Route } from './router';

export interface AppX {
  modules: Feature;
}

export interface InitialState {
  [key: string]: any;
}

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
    // tslint:disable-next-line:no-empty
    onError = () => {},
    // tslint:disable-next-line:no-empty
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
    public componentWillMount() {
      // tslint:disable-next-line:no-console
      console.log('app is running.');
    }

    public render() {
      return (
        <Provider store={store}>
          <PersistGate loading={undefined} persistor={store.persistor}>
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
